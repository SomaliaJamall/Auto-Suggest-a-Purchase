import configparser
import requests
import hmac
import hashlib
import base64
import time
from time import mktime
import urllib3
import datetime
import sys
import os
from email.utils import formatdate
from email.utils import formataddr
import json
import smtplib
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

config = configparser.ConfigParser()
config.read('staff.ini')
testLEAP = config['API']['TEST_HOST']+"/papiservice/REST"
prodLEAP = config['API']['HOST']+"/papiservice/REST"
apiID = config['API']['API_ACCESS_ID']
apiKey =  config['API']['API_KEY']
log_dir = "logs"
admin_pass= config['API']['ADMIN_PASSWORD']
formatMap=["Book","eBook","Audiobook (Physical CD)","eAudiobook","DVD","Music CD"]

ASAPRequestsUrl = config['API']['ASAP_HOST']+"/PHP/asap/"
mode = "test"
urlBase = testLEAP if (mode=="test") else prodLEAP #testLEAP or prodLEAP
port = config['EMAIL']['SMTP_PORT']
smtp_server = config['EMAIL']['SMTP_SERVER']


try:
    os.mkdir(log_dir)
    print(f"Directory '{log_dir}' created successfully.")
except FileExistsError:
    pass
    print(f"Directory '{log_dir}' already exists. Logs will be placed there.")
except PermissionError:
    print(f"Permission denied: Unable to create '{log_dir}'.")
except Exception as e:
    print(f"An error occurred: {e}")
    
errorLog = open("./"+log_dir+"/"+datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S_")+"errors.txt", "a")
infoLog = open("./"+log_dir+"/"+datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S_")+"info.txt", "a")

#REST API Managment
protectedApiSession = requests.Session()
protectedApiSession.headers.update({"Connection": "keep-alive",
                "Keep-Alive":"timeout=10, max=10000"})


#Let's get started!
class NullResponse:
  def __init__(self):
    self.status_code = -1
    self.PAPIErrorCode = -1

class StaffAuthResponse:
  def __init__(self, token, key):
    self.status_code = 200
    self.token = token
    self.key = key

def make_digest(message, key):
    key = bytes(key, 'UTF-8')
    message = bytes(message, 'UTF-8')

    digester = hmac.new(key, message, hashlib.sha1)
    signature1 = digester.digest()

    signature2 = (str(base64.urlsafe_b64encode(signature1))[2:-1]).strip("")
    return signature2

def staff_auth(apiID, apiKey):
    url = "https://"+urlBase+"/protected/v1/1033/100/1/authenticator/staff"
    body = "<?xml version='1.0' encoding='UTF-8'?><AuthenticationData><Domain>"+config['API']['STAFF_DOMAIN']+"</Domain><Username>"+config['API']['ADMIN_USER']+"</Username><Password>"+config['API']['ADMIN_PASSWORD']+"</Password></AuthenticationData>"
    i=0
    fails=0
    start = time.time()
    while i<100:
        try:
            date = formatdate(timeval=None, localtime=False, usegmt=True)
            message = "POST" + url + str(date)
            myHash = make_digest(message, apiKey)
            headers = {	'Authorization':"PWS {staffApiID}:{signature}".format(staffApiID=apiID,signature=myHash),
                'PolarisDate':str(date),
                'Content-Type':'application/xml',
                'Accept':'application/json'}
            protectedApiSession.headers.update(headers)
            response = protectedApiSession.post(url, verify=False, stream=True, data=body)
        except Exception as e:
            print(e)
            response = NullResponse()
            
        if (response.status_code == 200):
            success=response.json()
            print (success)
            print("-staff_auth Success(200) count",i)
            return StaffAuthResponse(success["AccessToken"], success["AccessSecret"])
        else:
            print(response.status_code, "Retry")
            fails=fails+1
            if(fails>100):
                print("-staff_auth failed")
                break
        i = i+1
    return NullResponse()

def searchBib(staffID, staffKey, myApiKey, isbn):
    url = "https://"+urlBase+"/public/v1/1033/100/1/search/bibs/keyword/ISBN?q="+isbn
    i=0
    if (isbn.strip() ==""):
        return -1

    while i<100:
        try:
            start = time.time()
            now = datetime.datetime.now()
            stamp = mktime(now.timetuple())
            rfc1123_date = formatdate(
                timeval     = stamp,
                localtime   = False,
                usegmt      = True
            )

            message = "GET" + url + rfc1123_date
            myHash = make_digest(message+staffKey, myApiKey)
            headers = {
                'Authorization':"PWS SuggestAPI:"+myHash,
                'Date':rfc1123_date,
                "Accept": "application/json",
                "Content-Type": "application/xml",
                "X-PAPI-AccessToken": staffID,
                "priority":"u=1, i"
                }
            
            response = requests.get(url, verify=False, headers=headers, stream=True, timeout=10)

        except Exception as e:
            print("-searchBib: network failure (will retry):", e)
            response = NullResponse()
            
        if (response.status_code == 200):
            success=response.json()
            if (success["PAPIErrorCode"] < 0):
                #Failure
                print("-searchBib - ERROR CODE:",success["PAPIErrorCode"], "MESSAGE:",success["ErrorMessage"])
                return -1
            else:
                #Success
                print("-searchBib: Success(200). Title: "+ str(success["BibSearchRows"]))
            return success["BibSearchRows"][0]["ControlNumber"]
        else:
            print("-searchBib: response.status_code: ",response.status_code)
            pass
        i = i+1

    print("-searchBib - Failure (max attempts exceeded)", "RESPONSE CODE: ",response)
    return -1


def lookupPatronID(staffID, staffKey, myApiKey, barcode):
    url = "https://"+urlBase+"/public/v1/1033/100/1/patron/"+barcode+"/basicdata"
    i=0
    while i<100:
        try:
            start = time.time()
            now = datetime.datetime.now()
            stamp = mktime(now.timetuple())
            rfc1123_date = formatdate(
                timeval     = stamp,
                localtime   = False,
                usegmt      = True
            )

            message = "GET" + url + rfc1123_date
            myHash = make_digest(message+staffKey, myApiKey)
            headers = {
                'Authorization':"PWS SuggestAPI:"+myHash,
                'Date':rfc1123_date,
                "Accept": "application/json",
                "Content-Type": "application/xml",
                "X-PAPI-AccessToken": staffID,
                "priority":"u=1, i"
                }
            
            response = requests.get(url, verify=False, headers=headers, stream=True, timeout=10)

        except Exception as e:
            print("-lookupPatronID: network failure (will retry):", e)
            response = NullResponse()
            
        if (response.status_code == 200):
            success=response.json()
            if (success["PAPIErrorCode"] < 0):
                #Failure
                print("-lookupPatronID - ERROR CODE:",success["PAPIErrorCode"], "MESSAGE:",success["ErrorMessage"])
                return [-1]
            else:
                #Success
                print("-lookupPatronID: Success(200). PatronID: "+ str(success["PatronBasicData"]["PatronID"]))
            email = ""
            try:
                email = success["PatronBasicData"]["EmailAddress"]
            except KeyError:
                email=""
            return [success["PatronBasicData"]["PatronID"],success["PatronBasicData"]["EmailAddress"], success["PatronBasicData"]["Barcode"], success["PatronBasicData"]["NameFirst"], success["PatronBasicData"]["NameLast"]]
        else:
            pass
        i = i+1
        time.sleep(0.25)

    print("-lookupPatronID - Failure (max attempts exceeded)", "RESPONSE CODE: ",response)
    return [-1]

def placeHold(staffID, staffKey, myApiKey, bib, pid, row, patronEmail, barcode, firstName, lastName):
    # TODO: place hold even if existing holds
    url = "https://"+urlBase+"/public/v1/1033/100/1/holdrequest"
    i=0

    while i<100:
        j = 0
        try:
            start = time.time()
            now = datetime.datetime.now()
            stamp = mktime(now.timetuple())
            rfc1123_date = formatdate(
                timeval     = stamp,
                localtime   = False,
                usegmt      = True
            )

            message = "POST" + url + rfc1123_date
            myHash = make_digest(message+staffKey, myApiKey)
            headers = {
                'Authorization':"PWS SuggestAPI:"+myHash,
                'Date':rfc1123_date,
                "Accept": "application/json",
                "Content-Type": "application/xml",
                "X-PAPI-AccessToken": staffID,
                "priority":"u=1, i"
                }
            myData="""<?xml version="1.0" encoding="UTF-8"?>
                    <HoldRequestCreateData>
                        <PatronID>{patronID}</PatronID>
                        <BibID>{bib}</BibID>
                        <PickupOrgID>0</PickupOrgID>
                        <WorkstationID>1</WorkstationID>
                        <UserID>1</UserID>
                        <RequestingOrgID>3</RequestingOrgID>
                    </HoldRequestCreateData>""".format(patronID = pid, bib=bib)
            
            response = requests.post(url, verify=False, headers=headers, stream=True, timeout=10, data=myData)

        except Exception as e:
            print("-placeHold: network failure (will retry):", e)
            response = NullResponse()
            
        if (response.status_code == 200):
            success=response.json()
            if (success["PAPIErrorCode"] < 0):
                #Failure
                print("-placeHold - ERROR CODE:",success["PAPIErrorCode"], "MESSAGE:",success["ErrorMessage"])
                print("-placeHold failed")
                errorLog.write("\n----placeHold failed "+date_string_fstring)
                errorLog.write("\n"+str(row))
                errorLog.write("\n"+str(success))
                return -1
            else:
                if(success["StatusType"]==1):
                    print("-placeHold - Issue placeing hold:",str(success))
                    errorLog.write("\n----placeHold failed "+date_string_fstring)
                    errorLog.write("\n"+str(row))
                    errorLog.write("\n"+str(success))
                    if success["StatusValue"]==6 or success["StatusValue"]==29:
                        return success["StatusValue"]
                    return -14
            
                if(success["StatusType"]==3 or success["StatusType"]==2):
                    while j<100:
                        try:
                            secondUrl ="https://"+urlBase+"/public/v1/1033/100/1/holdrequest/"+success["RequestGUID"]
                            now = datetime.datetime.now()
                            stamp = mktime(now.timetuple())
                            rfc1123_date = formatdate(
                                timeval     = stamp,
                                localtime   = False,
                                usegmt      = True
                            )

                            message = "PUT" + secondUrl + rfc1123_date
                            myHash = make_digest(message+staffKey, myApiKey)
                            headers = {
                                'Authorization':"PWS SuggestAPI:"+myHash,
                                'Date':rfc1123_date,
                                "Accept": "application/json",
                                "Content-Type": "application/xml",
                                "X-PAPI-AccessToken": staffID,
                                "priority":"u=1, i"
                                }
                            myResponseData="""<?xml version="1.0" encoding="UTF-8"?>
                            <HoldRequestReplyData>
                                <TxnGroupQualifier>{group}</TxnGroupQualifier>
                                <TxnQualifier>{qualifier}</TxnQualifier>
                                <RequestingOrgID>3</RequestingOrgID>
                                <Answer>1</Answer>
                                <State>3</State>
                            </HoldRequestReplyData>""".format(group = success["TxnGroupQualifer"], qualifier=success["TxnQualifier"])
                        
                            secondResponse = requests.put(secondUrl, verify=False, headers=headers, stream=True, timeout=10, data=myResponseData)
                        except Exception as e:
                            print("-placeHold: network failure (will retry):", e)
                            secondResponse = NullResponse()
                        if secondResponse.status_code == 200:
                            secondSuccess = json.loads(secondResponse.text)
                            if secondSuccess["PAPIErrorCode"] < 0:
                                #Failure
                                print("-placeHoldReply - ERROR CODE:",secondSuccess["PAPIErrorCode"], "MESSAGE:",secondSuccess["ErrorMessage"])
                                print("-placeHold failed")
                                errorLog.write("\n----placeHold failed "+date_string_fstring)
                                errorLog.write("\n"+str(row))
                                errorLog.write("\n"+str(secondSuccess))
                                return -1
                            else:
                                #Success
                                infoLog.write("\n----Hold placed with holds existing ")
                                infoLog.write("\n"+str(row))
                                infoLog.write("\n"+str(secondSuccess))
                                replyStatus = True
                                break
                        else:
                            print("-placeHoldResponse: secondResponse.status_code: ",secondResponse.status_code)
                        j=j+1
                        
                            
                if j ==100:
                    print("-placeHold - Failure (max attempts exceeded)", "RESPONSE CODE: ",response)
                    return -1
                #Success
                print("-placeHold: Success(200). Title: "+ str(success))
                print("Succeeded after", i+j, "attempts.", time.time()-start, "seconds.")
                sender_email = config['EMAIL']['SMTP_EMAIL']
                receiver_email = patronEmail
                

                # Plain text content
                text = """Hello {firstName} {lastName}
    Great news! The collection development team has reviewed your suggestion and your Library will order {title} by {author} in {format} format.
    A hold has been placed for {title} by {author} on the card {barcode}.
    This is a free service provided by your Library.""".format(title=row["title"],author=row["author"], format=formatMap[row["format"]], firstName=firstName, lastName=lastName,barcode=barcode)
                html = """\
<html>
  <head></head>
  <body>
    <p>Hello {firstName} {lastName}<p>
    <p>Great news! The collection development team has reviewed your suggestion and your Library will order {title} by {author} in {format} format.</p>
    <p>A hold has been placed for {title} by {author} on the card {barcode}.</p>
    <p>This is a free service provided by your Library.</p>
  </body>
</html>
""".format(title=row["title"].replace("\\", ""),author=row["author"].replace("\\", ""), format=formatMap[row["format"]], firstName=firstName, lastName=lastName,barcode=barcode)
                part1 = MIMEText(text, 'plain')
                part2 = MIMEText(html, 'html')
                # Create MIMEText object
                message = MIMEMultipart('alternative')
                message["Subject"] = "Hold Placed for the Material You Suggested"
                message["From"] = formataddr(("Library Collection Development",sender_email))
                message["To"] = receiver_email
                message.attach(part1)
                message.attach(part2)
                
                if receiver_email is None:
                    receiver_email=""
                #Send the email
                if receiver_email.strip() !="":
                    with smtplib.SMTP(smtp_server, port) as server:
                        server.starttls()  # Secure the connection
                        server.login(config['EMAIL']['SMTP_EMAIL'], config['EMAIL']['SMTP_PASSWORD'])
                        server.sendmail(sender_email, [receiver_email, config['EMAIL']['SMTP_EMAIL']], message.as_string())
                        infoLog.write("\n----hold placed and email sent to  "+receiver_email)
                        infoLog.write("\n"+str(row))
                        infoLog.write("\n"+str(success))
                        print('Email Sent')
                elif receiver_email.strip() =="":
                    print('No patron email provided: \n'+ text)
                    infoLog.write("\n----hold placed and no email sent - no patron email provided")
                    infoLog.write("\n"+str(row))
                    infoLog.write("\n"+str(success))
                return success["StatusValue"]
        else:
            print("-placeHold: response.status_code: ",response.status_code)
            pass
        i = i+1

    print("-placeHold - Failure (max attempts exceeded)", "RESPONSE CODE: ",response)
    return -1

def checkPatronCheckouts(staffID, staffKey, myApiKey, barcode):
    url = "https://"+urlBase+"/public/v1/1033/100/1/patron/"+barcode+"/itemsout/all?excludeecontent=true"
    i=0
    while i<100:
        try:
            start = time.time()
            now = datetime.datetime.now()
            stamp = mktime(now.timetuple())
            rfc1123_date = formatdate(
                timeval     = stamp,
                localtime   = False,
                usegmt      = True
            )

            message = "GET" + url + rfc1123_date
            myHash = make_digest(message+staffKey, myApiKey)
            headers = {
                'Authorization':"PWS SuggestAPI:"+myHash,
                'Date':rfc1123_date,
                "Accept": "application/json",
                "Content-Type": "application/xml",
                "X-PAPI-AccessToken": staffID,
                "priority":"u=1, i"
                }
            
            response = requests.get(url, verify=False, headers=headers, stream=True, timeout=10)

        except Exception as e:
            print("-checkPatronCheckouts: network failure (will retry):", e)
            response = NullResponse()
            
        if (response.status_code == 200):
            success=response.json()
            if (success["PAPIErrorCode"] < 0):
                #Failure
                print("-checkPatronCheckouts - ERROR CODE:",success["PAPIErrorCode"], "MESSAGE:",success["ErrorMessage"])
                return -1
            else:
                #Success
                print("-checkPatronCheckouts: Success(200). Barcode: "+ barcode)
            return success['PatronItemsOutGetRows']
        else:
            pass
        i = i+1

    print("-lookupPatronID - Failure (max attempts exceeded)", "RESPONSE CODE: ",response)
    return -1

start = time.time()

i=0
staffAuth= staff_auth(apiID, apiKey)



#check if we've acqiured an item and can place a hold
today = datetime.date.today()
date_string_fstring = f"{today:%m/%d/%Y}"
print("---------------------------Check if we've acqiured an item and can place a hold------------------------")
itemIds_awaitingHolds = []
while i<100:
    try:
        # get list of items awaiting holds/purchases from ASAP
        response = requests.get(ASAPRequestsUrl+"TitleRequests.php?status=1", verify=False, stream=True, timeout=10)

    except Exception as e:
        print("-getASAPRequest: network failure (will retry):", e)
        response = NullResponse()
        
    if (response.status_code == 200):
        success=response.json()
        #Success
        # print("-ASAPAllRequestsUrl: Success(200). rows: "+ str(success))
        print("Succeeded after", i, "attempts.")
        for row in success:
            print("------")
            print(row)
            #print(row["title"] +" ("+ row["identifier"]+")")
            bibID=row["bibid"]
            if(bibID.replace("-", "").replace(" ", "") == ""):
                bibID = searchBib(staffAuth.token, staffAuth.key, apiKey, row["identifier"].replace("-", "").replace(" ", ""))
                if int(bibID) < 0:
                    print("-searchBib failed")
                    errorLog.write("\n----searchBib failed "+date_string_fstring)
                    errorLog.write("\n"+str(row))
                    continue  
            patronID = lookupPatronID(staffAuth.token, staffAuth.key, apiKey, row["barcode"])
            if int(patronID[0]) < 0:
                print("-lookupPatronID failed")
                errorLog.write("\n----lookupPatronID failed "+date_string_fstring)
                errorLog.write("\n"+str(row))
                continue  
            placeHoldResult = placeHold(staffAuth.token, staffAuth.key, apiKey, bibID, patronID[0], row, patronID[1], patronID[2], patronID[3], patronID[4])
            if int(placeHoldResult) < 0 or int(placeHoldResult) ==29: #29 means the patron already placed a hold
                errorLog.write("\n----placeHold failed code: "+str(placeHoldResult))
                errorLog.write("\n------------------barcode: "+patronID[2])
                errorLog.write("\n--------------------BIBID: "+bibID)
                continue
            postResponse = requests.post(ASAPRequestsUrl+"UpdateTitleRequest.php",
                                    data=json.dumps({
                                        "id": row["id"],
                                        "title": row["title"],
                                        "author": row["author"],
                                        "identifier": row["identifier"],
                                        "format": row["format"],
                                        "agegroup": row["agegroup"],
                                        "notes": date_string_fstring +" HOLD PLACED FOR PATRON (system note). "+row["notes"],
                                        "editedBy": "system",
                                        "publication": row["publication"],
                                        "bibid":bibID,
                                        "status": 2,
                                        }),
                                    headers={"Content-Type": "application/json; charset=UTF-8"},
                                    verify=False,
                                    stream=True,
                                    timeout=10)
            if (postResponse.status_code == 200):
                print("-UpdateTitleRequest success", postResponse.text)
            else:
                print("-UpdateTitleRequest failure: ", postResponse.status_code)
                errorLog.write("\nUpdateTitleRequest failure: "+postResponse.status_code)
                errorLog.write("\n"+str(row))
                continue
            itemIds_awaitingHolds.append(bibID)
        break
    else:
        print("-ASAPAllRequestsUrl: response.status_code: ",response.status_code)
        errorLog.write("\n----ASAPAllRequestsUrl failed "+date_string_fstring)
        errorLog.write("\nresponse.status_code: "+response.status_code)
    i = i+1
    time.sleep(0.25)

#Check if items with holds were checked out
print("---------------------------Check if items with holds were checked out------------------------")
itemIds_checkedout = []
while i<100:
    try:
        # get list of items awaiting holds/purchases from ASAP
        response = requests.get(ASAPRequestsUrl+"TitleRequests.php?status=2", verify=False, stream=True, timeout=10)

    except Exception as e:
        print("-getASAPRequest: network failure (will retry):", e)
        response = NullResponse()
        
    if (response.status_code == 200):
        success=response.json()
        #Success
        print("Succeeded after", i, "attempts.")
        for row in success:
            print("------")
            print(row)
            checkouts = checkPatronCheckouts(staffAuth.token, staffAuth.key, apiKey, row["barcode"])
            if checkouts == -1:
                print("-checkPatronCheckouts failed")
                errorLog.write("\n----checkPatronCheckouts failed "+date_string_fstring)
                errorLog.write("\n"+str(row))
                continue  
            for checkout in checkouts:
                if(str(row["bibid"])== str(checkout["BibID"])):
                    postResponse = requests.post(ASAPRequestsUrl+"UpdateTitleRequest.php",
                                            data=json.dumps({
                                                "id": row["id"],
                                                "title": row["title"],
                                                "author": row["author"],
                                                "identifier": row["identifier"],
                                                "format": row["format"],
                                                "agegroup": row["agegroup"],
                                                "notes": date_string_fstring +" ITEM CHECKED OUT BY PATRON (system note). "+row["notes"],
                                                "editedBy": "system",
                                                "publication": row["publication"],
                                                "bibid":row["bibid"],
                                                "status": 4,
                                                }),
                                            headers={"Content-Type": "application/json; charset=UTF-8"},
                                            verify=False,
                                            stream=True,
                                            timeout=10)
                    if (postResponse.status_code == 200):
                        print("-UpdateTitleRequest success", postResponse.text)
                        infoLog.write("\n----Patron checked out material. BARCODE: "+ row["barcode"])
                        infoLog.write("\n"+str(row))
                        infoLog.write("\n"+str(postResponse))
                    else:
                        print("-UpdateTitleRequest failure ", postResponse.status_code)
                        errorLog.write("\n----UpdateTitleRequest failed "+date_string_fstring)
                        errorLog.write("\n"+str(row))
                        continue
                    itemIds_checkedout.append(row["bibid"])
        break
    else:
        print("-ASAPAllRequestsUrl: response.status_code: ",response.status_code)
        errorLog.write("\n----ASAPAllRequestsUrl failed "+date_string_fstring)
        errorLog.write("\nresponse.status_code: "+response.status_code)
    i = i+1
    time.sleep(0.25)
print("---------------------------Final Results------------------------")
print("New Items awaiting hold")
print(itemIds_awaitingHolds)
print("New Items checked out")
print(itemIds_checkedout)
end = time.time()
print(str(end-start)+ " seconds passed for script run")