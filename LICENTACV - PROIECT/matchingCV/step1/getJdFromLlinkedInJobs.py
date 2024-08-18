from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time
import pandas as pd
import re
import sys
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

DetectorFactory.seed = 0

def is_text_in_english(text):
    try:
        lang = detect(text)
        return lang == 'en'
    except LangDetectException:
        return False

def search_jobs(keywords="software engineer", location="Iasi, Romania"):
    jobs = []
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage") 
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--proxy-server='direct://'")
    chrome_options.add_argument("--proxy-bypass-list=*")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--ignore-certificate-errors")

    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    chrome_options.add_argument(f"user-agent={user_agent}")
    
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    except Exception as e:
        print("Error initializing the Chrome driver:", e)
        return []

    driver.maximize_window()

    driver.get("https://www.linkedin.com/")
    time.sleep(1)

    try:
        jobs_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/jobs/"]'))
        )
        jobs_link.click()
    except Exception as e:
        print("Error clicking on jobs link.")
        driver.quit()
        return []

    time.sleep(1)

    if keywords:
        try:
            keyword_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Search job titles or companies"]'))
            )
            keyword_field.send_keys(keywords)
        except Exception as e:
            print("Error entering keywords.")
            driver.quit()
            return []

    if location:
        try:
            location_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Location"]'))
            )
            location_field.clear()
            location_field.send_keys(location)
            location_field.send_keys(Keys.RETURN)
        except Exception as e:
            print("Error entering location.")
            driver.quit()
            return []

    time.sleep(1)

    flag = 0
    invalid_jobs = 0
    try:
        job_elements = driver.find_elements(By.CSS_SELECTOR, 'ul.jobs-search__results-list li')
    except Exception as e:
        print("Error finding job elements.")
        driver.quit()
        return []

    try:
        for i in range(0, len(job_elements)):
            if flag == 7 or invalid_jobs == 7:
                break
            time.sleep(2.5)
            job_elements[i].click()
            time.sleep(1)

            job_description_exists = driver.find_element(By.CLASS_NAME, 'two-pane-serp-page__detail-view')
            if job_description_exists.text == '':
                if len(job_elements) == 1:
                    job_elements[i].click()
                    time.sleep(3)
                    job_elements[i].click()
                if i == len(job_elements) - 1:
                    job_elements[i - 1].click()
                    time.sleep(3)
                    job_elements[i].click()
                else:
                    job_elements[i + 1].click()
                    time.sleep(3)
                    job_elements[i].click()

            try:
                wait = WebDriverWait(driver, 3)
                button = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, 'show-more-less-html__button-icon.show-more-less-button-icon.lazy-loaded')))
                button.click()
                job_description_div = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'show-more-less-html__markup.relative.overflow-hidden')))
            except Exception:
                invalid_jobs += 1
                continue

            if job_description_div.text:
                job_details_extracted = job_description_div.text
            else:
                invalid_jobs += 1
                continue

            try:
                title = job_elements[i].find_element(By.CLASS_NAME, 'base-search-card__title')
                company = job_elements[i].find_element(By.CLASS_NAME, 'base-search-card__subtitle')
                location = job_elements[i].find_element(By.CLASS_NAME, 'job-search-card__location')

                url_element = job_elements[i].find_element(By.XPATH, './/div/a')
                url = url_element.get_attribute('href')
            except Exception:
                invalid_jobs += 1
                continue

            if title.text and company.text and location.text and job_details_extracted and url and is_text_in_english(job_details_extracted.lower().strip()):
                jobs.append({
                    "ID": i,
                    'title': " " + title.text,
                    'url': " " + url,
                    'company': " " + company.text,
                    'location': " " + location.text,
                    'description': " " + job_details_extracted.lower().strip()
                })
                flag += 1
    except Exception as e:
        pass
    finally:
        driver.quit()

    return jobs


if __name__ == "__main__":
    try:
        if len(sys.argv) < 4:
            raise ValueError("Usage: script.py <keywords> <location_city> <location_country>.")
        
        keywords = sys.argv[1]
        location = sys.argv[2] + ", " + sys.argv[3]
        
        job_details = search_jobs(keywords=keywords,location=location)
        # job_details = search_jobs()
        try:
            job_details_df = pd.DataFrame(job_details)
            job_details_df.to_csv(r"C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1\dataLinkedIn.csv", index=False)
        except Exception as e:
            raise IOError(f"Error saving job details to CSV.")

        # save_to_mongo(job_details)
    except Exception as e:
        print(f"An error occurred during the job search or saving process.")
        sys.exit(1)
