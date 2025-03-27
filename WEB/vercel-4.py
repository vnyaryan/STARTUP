import os
import logging
import requests
import time
# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
BASE_URL = "https://api.vercel.com"
VERCEL_TOKEN = "3uyYCPaQ6KqkqnyD2FeIhf3s"  
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\AI\ai\WEB"
LOG_FILENAME = "vercel_4.log"

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
# CREATE PROJECT WITH GIT REPO
# ----------------------------------------------------------------------------
def create_project_with_git(project_name, repo_owner, repo_name, root_dir, framework):
    url = f"{BASE_URL}/v9/projects"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": project_name,
        "framework": framework,
        "gitRepository": {
            "type": "github",
            "repo": f"{repo_owner}/{repo_name}",
            "rootDirectory": "WEB/MATRIMONY-PROJECT",
            "enabled": True
        }
    }

    try:
        logging.debug(f"Sending POST request to {url} with payload: {payload}")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        project_id = data.get("id")
        logging.info(f"✅ Project '{project_name}' created successfully. ID: {project_id}")
        return True
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error during project creation: {http_err} - {response.text}")
    except Exception as e:
        logging.error(f"Unexpected error during project creation: {e}")
    return False

# ----------------------------------------------------------------------------
# ADD ENVIRONMENT VARIABLES
# ----------------------------------------------------------------------------
def add_environment_variables(project_name, env_vars):
    url = f"{BASE_URL}/v9/projects/{project_name}/env"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    for key, value in env_vars.items():
        payload = {
            "key": key,
            "value": value,
            "type": "encrypted",
            "target": ["production", "preview", "development"]
        }
        try:
            logging.debug(f"Adding env var '{key}' with payload: {payload}")
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            logging.info(f"✅ Env variable '{key}' added.")
        except requests.exceptions.HTTPError as http_err:
            logging.error(f"HTTP error for env var '{key}': {http_err} - {response.text}")
        except Exception as e:
            logging.error(f"Unexpected error while adding env var '{key}': {e}")

# ----------------------------------------------------------------------------
# GET REPO ID FOR DEPLOYMENT
# ----------------------------------------------------------------------------
# def get_repo_id(project_name):
#     url = f"{BASE_URL}/v9/projects/{project_name}"
#     headers = {
#         "Authorization": f"Bearer {VERCEL_TOKEN}"
#     }
#     try:
#         response = requests.get(url, headers=headers)
#         response.raise_for_status()
#         data = response.json()
#         repo_id = data.get("link", {}).get("repoId")
#         if repo_id:
#             logging.info(f"✅ Retrieved repoId: {repo_id}")
#             return repo_id
#         else:
#             logging.error("❌ repoId not found in project data.")
#     except Exception as e:
#         logging.error(f"Error retrieving repoId: {e}")
#     return None

# ----------------------------------------------------------------------------
# TRIGGER DEPLOYMENT WITH GITHUB
# ----------------------------------------------------------------------------
def trigger_deployment(project_name, repo_id):
    url = f"{BASE_URL}/v13/deployments"
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": project_name,  # <-- Add this line
        "project": project_name,
        "gitSource": {
            "type": "github",
            "repoId": repo_id,
            "ref": "main"
        }
    }

    try:
        logging.debug(f"Triggering deployment with payload: {payload}")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        deployment_url = data.get("url")
        logging.info(f"🚀 Deployment triggered: https://{deployment_url}")
    except requests.exceptions.HTTPError as http_err:
        logging.error(f"HTTP error during deployment: {http_err} - {response.text}")
    except Exception as e:
        logging.error(f"Unexpected error during deployment: {e}")


# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        setup_logging()
        logging.info("Script started.")

        # ---- INPUT DETAILS ----
        PROJECT_NAME = "startup"
        REPO_OWNER = "vnyaryan"
        REPO_NAME = "STARTUP"
        ROOT_DIR = "WEB/MATRIMONY-PROJECT"
        FRAMEWORK = "nextjs"

        ENV_VARS = {
            "REDIS_URL": "redis://default:VM3hQnN22dM1sdUNgQZ1kJNyWpmra7gw@redis-18724.c301.ap-south-1-1.ec2.redns.redis-cloud.com:18724",
            "JWT_SECRET": "hks97rotkfqf1zezgm1j8mnm1re2p7iqy633xf0rnkvi568lp3hauupmas3y5u2w"
        }

        # Step 1: Create Project
        created = create_project_with_git(PROJECT_NAME, REPO_OWNER, REPO_NAME, ROOT_DIR, FRAMEWORK)

        if created:
            time.sleep(5)  # Wait briefly before adding env vars
            # Step 2: Add Env Vars
            add_environment_variables(PROJECT_NAME, ENV_VARS)
            time.sleep(3)  # Wait before deployment
            #Step 3: Retrieve repoId & Trigger Deployment
        #     repo_id = get_repo_id(PROJECT_NAME)
        #     if repo_id:
        #         trigger_deployment(PROJECT_NAME, repo_id)
        #     else:
        #         logging.error("❌ Could not trigger deployment: repoId is missing.")
        else:
            logging.error("❌ Project creation failed. Skipping env vars and deployment.")

        logging.info("Script finished successfully.")
    except Exception as e:
        logging.critical(f"Script terminated due to error: {e}")
