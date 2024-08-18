from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
from pymongo import MongoClient
import pandas as pd
import sys
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException
import random

DetectorFactory.seed = 0

def is_text_in_english(text):
    try:
        lang = detect(text)
        return lang == 'en'
    except LangDetectException:
        return False

def is_element_in_viewport(driver, element):
    return driver.execute_script(
        "var rect = arguments[0].getBoundingClientRect();"
        "return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));",
        element
    )

def search_jobs(keywords="social media marketing", location="Cluj", country="Romania"):
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

    wait = WebDriverWait(driver, 10)

    try:
        driver.get("https://www.indeed.com/?hl=en&co=us&countrySelector=1")
        time.sleep(random.uniform(1.5, 3.5))  
    except Exception as e:
        print("Error opening the Indeed website:", e)
        driver.quit()
        return []

    try:
        driver.save_screenshot("initial_screenshot.png") 
        worldwide_link = wait.until(
            EC.presence_of_element_located((By.XPATH, '//a[contains(text(), "Countries")]'))
        )
        worldwide_href = worldwide_link.get_attribute('href')
        driver.get(worldwide_href)
        time.sleep(random.uniform(1.5, 3.5))  
    except Exception as e:
        driver.save_screenshot("screenshot_countries_link_error.png")
        print("Worldwide link not found or not clickable:", e)
        driver.quit()
        return []

    try:
        country_link = wait.until(
            EC.presence_of_element_located((By.XPATH, f'//a[@class="worldwide__link" and .//span[contains(text(), "{country}")]]'))
        )
        country_href = country_link.get_attribute('href')
        driver.get(country_href)
        time.sleep(random.uniform(1.5, 3.5))
    except Exception as e:
        driver.save_screenshot("screenshot_country_link_error.png")
        print(f"Country link for {country} not found or not clickable:", e)
        driver.quit()
        return []

    try:
        what_field = wait.until(
            EC.presence_of_element_located((By.XPATH, '//input[@id="text-input-what"]'))
        )
        where_field = wait.until(
            EC.presence_of_element_located((By.XPATH, '//input[@id="text-input-where"]'))
        )
    except Exception as e:
        print("Search fields not found:", e)
        driver.quit()
        return []

    if keywords:
        try:
            what_field.send_keys(Keys.CONTROL + "a")
            what_field.send_keys(Keys.DELETE)
            what_field.send_keys(keywords)
            time.sleep(random.uniform(0.5, 1.5))  # Add random delay
        except Exception as e:
            print("Error entering keywords:", e)
            driver.quit()
            return []

    if location:
        try:
            where_field.send_keys(Keys.CONTROL + "a")
            where_field.send_keys(Keys.DELETE)
            where_field.send_keys(location)
            time.sleep(random.uniform(0.5, 1.5))  # Add random delay
        except Exception as e:
            print("Error entering location:", e)
            driver.quit()
            return []

    try:
        search_button = wait.until(
            EC.element_to_be_clickable((By.CLASS_NAME, 'yosegi-InlineWhatWhere-primaryButton'))
        )
        driver.execute_script("arguments[0].scrollIntoView();", search_button)
        search_button.click()
    except Exception as e:
        print("Search button not found or not clickable:", e)
        driver.quit()
        return []

    time.sleep(2)
    
    try:
        total_height = driver.execute_script("return document.body.scrollHeight")
        scroll_height = total_height * 0.30
    except Exception as e:
        print("Error scrolling elements:", e)
        driver.quit()
        return []

    try:
        company = driver.find_elements(By.CLASS_NAME, 'css-63koeb.eu4oa1w0')
        location = driver.find_elements(By.CLASS_NAME, 'css-1p0sjhy.eu4oa1w0')
        title = driver.find_elements(By.CLASS_NAME, 'jobTitle.css-198pbd.eu4oa1w0')
        url_a_tag = driver.find_elements(By.CLASS_NAME, 'jcs-JobTitle.css-jspxzf.eu4oa1w0')
    except Exception as e:
        print("Error finding job elements:", e)
        driver.quit()
        return []

    try:
        for i in range(len(title)):
            time.sleep(1)
            if EC.element_to_be_clickable(title[i]):
                title[i].click()
            else:
                continue

            try:
                driver.execute_script(f"window.scrollBy(0, {scroll_height});")
                time.sleep(1)
                description = wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'jobsearch-JobComponent-description.css-16y4thd.eu4oa1w0')))
            except Exception:
                continue

            if title[i].text and company[i].text and location[i].text and is_text_in_english(description.text.lower().strip()):
                jobs.append({
                    "ID": i,
                    'title': " " + title[i].text,
                    'url': " " + url_a_tag[i].get_attribute('href'),
                    'company': " " + company[i].text,
                    'location': " " + location[i].text,
                    'description': " " + description.text.lower().strip()
                })
    except Exception as e:
        pass
    finally:
        driver.quit()

    return jobs

def save_to_mongo(job_details, db_name="test", collection_name="jobs"):
    try:
        client = MongoClient("mongodb+srv://nituantonia21:VXY93szCKh@cluster0.odni9oh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client[db_name]
        collection = db[collection_name]
    except Exception as e:
        print("Error connecting to MongoDB:", e)
        return

    for job_detail in job_details:
        try:
            collection.insert_one(job_detail)
            print("Data saved to MongoDB successfully.")
        except Exception as e:
            print("Error saving job to MongoDB:", e)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 4:
            raise ValueError("Usage: script.py <keywords> <location_city> <location_country>.")
        
        keywords = sys.argv[1]
        location = sys.argv[2]
        country = sys.argv[3]
        
        job_details = search_jobs(keywords=keywords.lower(), location=location.lower(), country=country)

        # job_details = search_jobs("software", "Cluj", "Romania")

        try:
            job_details_df = pd.DataFrame(job_details)
            job_details_df.to_csv(r"C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1\dataIndeed.csv", index=False)
        except Exception as e:
            raise IOError("Error saving job details to CSV:", e)

        # save_to_mongo(job_details)
   
    except Exception as e:
        print("An error occurred during the job search or saving process:", e)
        sys.exit(1)