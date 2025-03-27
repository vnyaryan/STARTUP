import os
import logging
import requests

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
BASE_URL = "https://api.vercel.com"
VERCEL_TOKEN = "3uyYCPaQ6KqkqnyD2FeIhf3s"  
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\AI\ai\WEB"
LOG_FILENAME = "vercel_2.log"

# ----------------------------------------------------------------------------
# LOGGING SETUP
# ----------------------------------------------------------------------------
def setup_logging():
    try:
        os.makedirs(LOG_DIRECTORY, exist_ok=True)
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename=os.path.join(LOG_DIRECTORY, LOG_FILENAME),
            filemode='w'
        )
        logging.debug("Logging setup completed.")
    except Exception as e:
        print(f"Failed to setup logging: {e}")
        raise



# ----------------------------------------------------------------------------
# FUNCTION TO CREATE CUSTOM ENVIRONMENT
# ----------------------------------------------------------------------------
def create_custom_environment(slug, description="", branch_pattern="", copy_env_from=""):
    url = f"{BASE_URL}/v9/projects/vnyaryan-gmailcoms-projects/custom-environments"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "slug": slug,
    }

    if description:
        payload["description"] = description

    if branch_pattern:
        payload["branchMatcher"] = {
            "type": "equals",
            "pattern": branch_pattern
        }

    if copy_env_from:
        payload["copyEnvVarsFrom"] = copy_env_from

    try:
        logging.debug(f"Sending POST request to {url} with payload: {payload}")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logging.info(f"Custom environment '{slug}' created successfully.")
        logging.debug(f"Response: {response.json()}")
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error: {http_err} - Response: {response.text}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        setup_logging()
        logging.info("Script started.")

        # ---- PARAMETERS ----
        CUSTOM_ENV_SLUG = "staging-env"
        CUSTOM_ENV_DESCRIPTION = "Staging environment for QA"
        BRANCH_PATTERN = "qa-branch"
        COPY_ENV_FROM = "preview"  # Copy from 'preview' or another custom environment slug

        # Create the custom environment
        create_custom_environment(
            slug=CUSTOM_ENV_SLUG,
            description=CUSTOM_ENV_DESCRIPTION,
            branch_pattern=BRANCH_PATTERN,
            copy_env_from=COPY_ENV_FROM
        )

        logging.info("Script finished successfully.")
    except Exception as e:
        logging.critical(f"Script terminated due to error: {e}")
