# preprocessor.py
import re
import collections
import urllib.parse
import json
import os
from typing import Dict, Any, Optional, List, Tuple, Set
from thefuzz import fuzz

SIMILARITY_THRESHOLD = 88
HISTORY_SIZE = 10
DEFAULT_POLITENESS_FILE = "keywords/politeness.json"
DEFAULT_CS_KEYWORDS_FILE = "keywords/computer_science.json"
DEFAULT_NON_CS_KEYWORDS_FILE = "keywords/non_computer_science.json"
DEFAULT_BASH_COMMANDS_FILE = "keywords/bash_commands.json"


def _load_keywords_from_json(
    filepath: str, is_set: bool = True
) -> Optional[Set[str] | List[str]]:
    if not os.path.exists(filepath):
         print(f"Error: Keyword file not found: {filepath}")
         return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

            if not isinstance(data, list):
                print(f"Warning: Expected a JSON list in {filepath}, got {type(data)}.")
                return set() if is_set else []

            keywords = [str(item).lower() for item in data]
            return set(keywords) if is_set else keywords
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from file: {filepath}")
        return None
    except Exception as e:
        print(f"Error loading keywords from {filepath}: {e}")
        return None

class PromptPreprocessor:
    def __init__(
        self,
        politeness_file: str = DEFAULT_POLITENESS_FILE,
        cs_keywords_file: str = DEFAULT_CS_KEYWORDS_FILE,
        non_cs_keywords_file: str = DEFAULT_NON_CS_KEYWORDS_FILE,
        bash_commands_file: str = DEFAULT_BASH_COMMANDS_FILE,
    ):
        self.history = collections.deque(maxlen=HISTORY_SIZE)
        loaded_politeness = _load_keywords_from_json(politeness_file, is_set=False)
        loaded_cs = _load_keywords_from_json(cs_keywords_file, is_set=True)
        loaded_non_cs = _load_keywords_from_json(non_cs_keywords_file, is_set=True)
        loaded_bash = _load_keywords_from_json(bash_commands_file, is_set=True)

        if (
            loaded_politeness is None
            or loaded_cs is None
            or loaded_non_cs is None
            or loaded_bash is None
        ):
            missing = []
            if loaded_politeness is None: missing.append(politeness_file)
            if loaded_cs is None: missing.append(cs_keywords_file)
            if loaded_non_cs is None: missing.append(non_cs_keywords_file)
            if loaded_bash is None: missing.append(bash_commands_file)
            raise ValueError(
                "Failed to load one or more keyword files. "
                f"Check: {', '.join(missing)}. Preprocessor cannot start."
            )

        self.politeness_phrases: List[str] = loaded_politeness
        self.cs_keywords: Set[str] = loaded_cs
        self.non_cs_keywords: Set[str] = loaded_non_cs
        self.bash_commands: Set[str] = loaded_bash

        print("--- Preprocessor Initialized ---")
        print(f"- History size: {HISTORY_SIZE}")
        print(f"- Similarity threshold: {SIMILARITY_THRESHOLD}")
        print(f"- Politeness phrases loaded: {len(self.politeness_phrases)}")
        print(f"- CS keywords loaded: {len(self.cs_keywords)}")
        print(f"- Non-CS keywords loaded: {len(self.non_cs_keywords)}")
        print(f"- Bash commands loaded: {len(self.bash_commands)}")
        print("--------------------------------")


    def _normalize_prompt(self, prompt: str) -> str:
        return " ".join(prompt.lower().split())

    def _check_repetition(self, normalized_prompt: str) -> Optional[Dict[str, Any]]:
        for old_prompt in self.history:
            similarity = fuzz.ratio(normalized_prompt, old_prompt)
            if similarity >= SIMILARITY_THRESHOLD:
                print(f"Repetition detected (Similarity: {similarity}%)")
                return {
                    "action": "reject",
                    "reason": "repeated_request",
                    "message": (
                        "Cette demande semble très similaire à celle que vous avez faite récemment. Veuillez consulter l'historique de la conversation."
                    ),
                }
        return None

    def _check_politeness(self, normalized_prompt: str) -> Optional[Dict[str, Any]]:
        if any(phrase in normalized_prompt for phrase in self.politeness_phrases):
            print("Politeness phrase detected.")
            return {
                "action": "inform",
                "reason": "politeness",
                "message": (
                    "Ajouter des salutations ou des phrases de conversation augmente le traitement requis par l'IA. Pour plus d'efficacité, essayez  d'aller droit au but dans vos futures demandes."
                ),
            }
        return None

    def _check_bash_command(self, normalized_prompt: str) -> Optional[Dict[str, Any]]:
        patterns = [
            r"^(?:what is|what does|how to use|options for|man page for|man)\s+`?([a-zA-Z0-9_-]+)`?\b",
            r"^`?([a-zA-Z0-9_-]+)`?\s+\?$",
            r"^`?([a-zA-Z0-9_-]+)`?$",
        ]

        for pattern in patterns:
            match = re.search(pattern, normalized_prompt)
            if match:
                command_name = match.group(1).strip("`")

                if command_name in self.bash_commands:
                    print(f"Bash command detected: {command_name}")
                    return {
                        "action": "reject",
                        "reason": "bash_command",
                        "message": (
                            f" Il semble que votre question porte sur la commande '{command_name}'. La page de manuel officielle (« man page ») est la meilleure source. Sous Linux/macOS, essayez d'exécuter ceci dans votre terminal : man {command_name}"
                        ),
                    }
        return None


    def _check_domain(self, normalized_prompt: str) -> Optional[Dict[str, Any]]:
        tokens = set(re.findall(r"\b\w+\b", normalized_prompt))
        cs_score = len(tokens.intersection(self.cs_keywords))
        non_cs_score = len(tokens.intersection(self.non_cs_keywords))

        is_non_cs = False
        if not tokens: 
             is_non_cs = False
        elif cs_score == 0 and non_cs_score >= 1:
             is_non_cs = True
        elif cs_score > 0 and non_cs_score > cs_score * 2.0:
             is_non_cs = True

        if is_non_cs:
            print(f"Non-CS domain detected (CS: {cs_score}, Non-CS: {non_cs_score})")
            return {
                "action": "reject",
                "reason": "non_cs_domain",
                "message": (
                    "Cette demande ne semble pas avoir de rapport avec l'informatique. Afin de préserver les ressources, cet assistant se concentre sur les sujets liés à l'informatique."
                ),
            }
        return None

    def _check_simplicity(
        self, prompt: str, normalized_prompt: str
    ) -> Optional[Dict[str, Any]]:
        is_simple_definitional = False
        if len(normalized_prompt.split()) < 6:
            if re.match(
                r"^(what is|what's|define|who is|who's|where is|where's|capital of)\s+",
                normalized_prompt,
            ):
                is_simple_definitional = True

        if is_simple_definitional:
            print("Simple definitional query detected.")
            try:
                query_encoded = urllib.parse.quote_plus(prompt)
                search_link = f"https://letmegooglethat.com/?q={query_encoded}"
                message = (
                    f"Il s'agit d'une question simple à laquelle une recherche rapide sur Internet peut répondre ! Essayez de faire une recherche directe : {search_link}"
                )
            except Exception as e:
                 print(f"Error creating search link: {e}")
                 message = (
                    "Il s'agit d'une question simple à laquelle une recherche rapide sur Internet peut répondre ! Essayez de faire une recherche directe."
                )

            return {
                "action": "reject",
                "reason": "too_simple",
                "message": message,
            }
        return None

    def preprocess_prompt(self, prompt: str) -> Dict[str, Any]:
        print(f"\nPreprocessing prompt: '{prompt}'")

        if not prompt or not prompt.strip():
            print("Rejected: Empty prompt")
            return {
                "action": "reject",
                "reason": "empty_prompt",
                "message": "Le prompt ne peut pas être vide. Veuillez saisir une question ou une demande.",
            }

        normalized_prompt = self._normalize_prompt(prompt)
        print(f"Normalized prompt: '{normalized_prompt}'")

        repetition_check = self._check_repetition(normalized_prompt)
        if repetition_check:
            print(f"Result: {repetition_check['action']} ({repetition_check['reason']})")
            return repetition_check

        bash_check = self._check_bash_command(normalized_prompt)
        if bash_check:
            print(f"Result: {bash_check['action']} ({bash_check['reason']})")
            self.history.append(normalized_prompt)
            return bash_check

        simplicity_check = self._check_simplicity(prompt, normalized_prompt)
        if simplicity_check:
            print(f"Result: {simplicity_check['action']} ({simplicity_check['reason']})")
            self.history.append(normalized_prompt)
            return simplicity_check

        domain_check = self._check_domain(normalized_prompt)
        if domain_check:
            print(f"Result: {domain_check['action']} ({domain_check['reason']})")
            self.history.append(normalized_prompt)
            return domain_check

        politeness_info = self._check_politeness(normalized_prompt)

        self.history.append(normalized_prompt)

        if politeness_info:
            print("Result: inform_and_pass (politeness)")
            return {
                "action": "inform_and_pass",
                "message": politeness_info["message"],
                "original_prompt": prompt,
            }
        else:
            print("Result: pass")
            return {
                "action": "pass",
                "original_prompt": prompt,
            }

if __name__ == "__main__":
    print("Testing PromptPreprocessor standalone...")
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        preprocessor = PromptPreprocessor(
             politeness_file=os.path.join(script_dir, DEFAULT_POLITENESS_FILE),
             cs_keywords_file=os.path.join(script_dir, DEFAULT_CS_KEYWORDS_FILE),
             non_cs_keywords_file=os.path.join(script_dir, DEFAULT_NON_CS_KEYWORDS_FILE),
             bash_commands_file=os.path.join(script_dir, DEFAULT_BASH_COMMANDS_FILE),
        )

        test_prompts = [
            "Hello, could you please explain the difference between TCP and UDP?", # inform_and_pass
            "What is Python?", # reject (too_simple)
            "man grep", # reject (bash_command)
            "grep", # reject (bash_command)
            "how to use ls", # reject (bash_command)
            "ls -l ?", # reject (bash_command) - Might need refinement if flags are common
            "Write a complex algorithm for graph traversal.", # pass
            "Tell me about the history of Rome.", # reject (non_cs_domain)
            "Write a complex algorithm for graph traversal.", # reject (repeated_request)
            "Explain quantum computing concepts.", # pass
            "Define server", # reject (too_simple)
            "My code gives a segmentation fault, what could be wrong?", # pass
            "", # reject (empty_prompt)
            "   ", # reject (empty_prompt)
            "Thanks!", # inform_and_pass
            "what is the capital of france", # reject (too_simple)
            "what is biology?", # reject (non_cs_domain)
        ]

        for i, p in enumerate(test_prompts):
            print(f"\n--- Test Input {i+1} ---")
            result = preprocessor.preprocess_prompt(p)
            print(f"Action: {result['action']}")
            if "message" in result:
                print(f"Message:\n{result['message']}")
            if result["action"] in ["pass", "inform_and_pass"]:
                print(f"Prompt to forward: '{result.get('original_prompt', '')}'")
            print("-" * 20)

    except ValueError as e:
        print(f"\n❌ Initialization Error: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred during testing: {e}")

