import os
import logging
import requests

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
BASE_URL = "https://api.vercel.com"
VERCEL_TOKEN = "3uyYCPaQ6KqkqnyD2FeIhf3s"  
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\AI\ai\WEB"
LOG_FILENAME = "vercel_3.log"

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
# FUNCTION TO CREATE PROJECT
# ----------------------------------------------------------------------------
def create_project(project_name, framework_preset=None):
    url = f"{BASE_URL}/v9/projects"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": project_name
    }

    if framework_preset:
        payload["framework"] = framework_preset

    try:
        logging.debug(f"Sending POST request to {url} with payload: {payload}")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        logging.info(f"✅ Project '{project_name}' created successfully. Project ID: {data.get('id')}")
        logging.debug(f"Response Data: {data}")
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"❌ HTTP error: {http_err} - Response: {response.text}")
    except Exception as e:
        logging.error(f"❌ Unexpected error: {e}")

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        setup_logging()
        logging.info("Script started.")

        # ---- INPUT PARAMETERS ----
        PROJECT_NAME = "my-new-vercel-project"  # Replace with your desired project name
        FRAMEWORK = "nextjs"  # Optional: e.g., "react", "vue", etc.

        # Create the Vercel project
        create_project(PROJECT_NAME, FRAMEWORK)

        logging.info("Script finished successfully.")
    except Exception as e:
        logging.critical(f"Script terminated due to error: {e}")
