import os
import logging
import requests

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
BASE_URL = "https://api.vercel.com"
VERCEL_TOKEN = "3uyYCPaQ6KqkqnyD2FeIhf3s"  
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\AI\ai\WEB"
LOG_FILENAME = "vercel_1.log"

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
# FUNCTION TO LIST AUTH TOKENS
# ----------------------------------------------------------------------------
def list_auth_tokens():
    url = f"{BASE_URL}/v5/user/tokens"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        logging.debug(f"Sending GET request to {url}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        tokens = data.get('tokens', [])
        if tokens:
            logging.info(f"Retrieved {len(tokens)} auth tokens:")
            for token in tokens:
                log_msg = (f"Token ID: {token['id']}, Name: {token['name']}, "
                           f"CreatedAt: {token['createdAt']}")
                logging.info(log_msg)
        else:
            logging.info("No auth tokens found.")
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error occurred: {http_err} - Response: {response.text}")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        setup_logging()
        logging.info("Script started.")
        list_auth_tokens()
        logging.info("Script finished successfully.")
    except Exception as e:
        logging.critical(f"Script terminated due to error: {e}")
