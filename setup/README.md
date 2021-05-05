## Prerequisite components

- SAP Kyma Runtime
- SAP SuccessFactors
- DocuSign


## SAP SuccessFactors System Registration
To connect to a SAP SuccessFactors system we first have to register it on the SAP BTP global account.

1. Create a new SAP SucessFactors System
    * Go to your global SAP Cloud Account and select Systems
    * Click on Register System
    * Set a system Name - we will need this name in later section.
    * Select SAP SuccessFactors as type
    * Click on Register

   ![BTP](./images/scp-1.png)

2. In the Register System pop-up copy the generated token to a local file and close the window. The status of the SAP SuccessFactors system is now pending.

   ![Register SF System](./images/scp-2.png)

3. Go to your SAP SuccessFactors Provisioning Tool Home Page. Select your company.

   ![Register SF System](./images/sf-1.png)

4. In the Edit Company Settings click on Extension Management Configuration

   ![Register SF System](./images/sf-2.png)

5. In the Add New Integration section insert the token from your SAP Business Technology Platform account and click on add

   ![Register SF System](./images/sf-3.png)

6. At your SAP Business Technology Platform account the system should now have the status "Registered"

   ![Register SF System](./images/scp-4.png)

### <u>SAP SuccessFactors Extensibility</u>

After creating the SuccessFactors System we are now able to create an entitlement for the SuccessFactors Extensibility service.

1. In your SAP Business Technology Platform sub-account select Entitlements. Click on Configure Entitlements and then on Add Service Plans.

   ![Register SF System](./images/scp-5.png)
   ![Register SF System](./images/scp-6.png)


2. Select SAP SuccessFactors Extensibility. Select the SuccessFactors system you have created in the section before. Check the api-access plan. Press Add Service Plan.

   ![Register SF System](./images/scp-7.png)

3. Save the new entitlement

   ![Register SF System](./images/scp-8.png)

4. Navigate to Kyma Dashboard on <code>Catalog -> SAP SuccessFactors Extensibility</code> and create a new instance,
   and specifying following parameters:

    ```bash
    {
      "systemName": "SuccessFactors", // Replace with your name
      "technicalUser": "sfadmin" // replace with your technical user
    }
    ```

   To benefit out of SAP SuccessFactors API,  bind your application to created instance and all SAP SuccessFactors
   credentials will be accessible as environment variables.

## SAP SuccessFactors Event Notifications

SAP SuccessFactors allow subscriptions to different events coming as result of different operations on the system.
Following steps are required to have a subscription to <code>Job Title Update</code> events as per our PoC.

1. Login SAP SuccessFactors using admin tenant account.


2. Navigate to <code>Admin Center</code>

   ![Event Notification](./images/sf-6.png)

3. Current PoC has implemented push events mechanism over WebHook.

    - WebHook configuration, follow the steps of [Push Event using WebHook](#push-event-using-webhook)

### Push Event using WebHook

Here we will cover the SAP SuccessFactors WebHook configuration, which will push event to out PoC.
Current PoC does expose a REST Endpoint <code>POST /webhook/success-factors</code> where the events will push to:

1. On <code>Tools</code> searching bar, look for <code>Event Notification Subscription</code>

   ![Event Notification](./images/sf-7.png)

2. Create a new Subscriber under <code>Subscriber</code> tab if not exist already,
   by clicking <code>Edit Subscriber</code> then <code>+ Add Subscriber</code>.

   ![Event Notification](./images/sf-8.png)

   ![Event Notification](./images/sf-9.png)
   Replace Example Subscribe Id, Name, Group & Client Id with some unique and meaningful names.
   Click the button <code>Save</code>.


3. Navigate to <code>SEB External Event</code> tab & click the <code>+ Add Topic</code> button.

   ![Event Notification](./images/sf-12.png)

    * Form list select the event to which you want to subscribe to, select the event <code>Change in Job Title</code>.
      Click the button <code>Save</code>.

      ![Event Notification](./images/sf-11.png)

    * Click the button <code>+ Add Subscription</code>. After full-filing all information click the button <code>Save</code>.

      ![Event Notification](./images/sf-12.png)

    - For column SEB Event Type - <i>Select <code>External Event Alert</code>from the list</i>
    - For column Endpoint Url - <i>Introduce your public URL endpoint of your microservice,
      to which events will be pushed using HTTP POST method</i>.
      For instance: https://successfactors-middleware.c-XXXXXX.kyma.shoot.live.k8s-hana.ondemand.com/webhook/success-factors
    - For column Subscriber - <i>Select early created subscriber under <code>Subscriber</code>tab</i>
    - For column Authentication - <i>Client on provided link, and select authentication method</i>

      ![Event Notification](./images/sf-13.png)

      We will choose <code>OAuth2 Client Credentials Grant</code>

      ![Event Notification](./images/sf-14.png)

      Full-fill all OAuth2 credentials used to protect your microservice public URL endpoint.
      All fields values should be collected from Kyma Dashboard under <code>OAuth Clients</code> left menu,
      only after deploying the application, see the of [application configuration](#application-configurations).

## DocuSign
As was already stated early, you should have a ready DocuSign account.

### Communication to DocuSign
In order to be able to call DocuSign API following configuration are required as per this PoC.

* Navigate to <code>Settings -> INTEGRATIONS -> Apps and Keys</code>

  ![DocuSign](./images/ds-4.png)

* Collect the <code>API Username</code> UUID value and save into a temporary file
   ```
    docu_sign_api_user_id: 6cbea6de-3593-4423-ba36-1f27da379c07
   ```

* Collect the <code>API Account ID</code> UUID value and save into a temporary file
   ```
    docu_sign_account_id: 022d968e-5d22-42a3-95bc-9724d0a66703
   ```

* Add configuration to integrate with your app by clicking on the button <code>ADD APP & INTEGRATION KEY</code>

  ![DocuSign](./images/ds-5.png)

*  Giving name <code>TFE-UseCase-Testing</code> and click the <code>ADD</code> button

![DocuSign](./images/ds-6.png)

*  Collect the <code>Integration Key</code> UUID value and save into a temporary file
   ```
    docu_sign_api_integration_key: fc6851eb-e7ed-4689-ba65-652d2a271ad3
   ```

   ![DocuSign](./images/ds-8.png)

*  Click the button <code>+ GENERATE RSA</code>

   ![DocuSign](./images/ds-7.png)

*  Collect the private key and save into a temporary file
    ```
      DOCU_SIGN_API_PRIVATE_KEY: -----BEGIN RSA PRIVATE KEY----- MIIEowIBAAKCAQEApIYitxlfr+rBaE+ziC7fvjLgAPz6NqUVI8I1FD9YWOC30NHN ....
    ```
   ![DocuSign](./images/ds-9.png)

*  Specify the Redirect URI

   ![DocuSign](./images/ds-10.png)


*  Following JWT Granting consent operation is required.
   More details can be found on DocuSign [blog](https://www.docusign.com/blog/developers/oauth-jwt-granting-consent)

   ```
   Http Request Syntax:
        SERVER/oauth/auth?response_type=code &scope=signature%20impersonation&client_id=CLIENT_ID &redirect_uri=REDIRECT_URI
  
   Where:
        SERVER is https://account.docusign.com (production) or https://account-d.docusign.com (developer demo).
        CLIENT_ID is your app’s integration key.
        The REDIRECT_URI is a URI. It must exactly match one of the redirect URIs you defined for the app’s integration key in the DocuSign eSignature Administration tool. The URI value must be encoded.
   ```

   Copy the following URL into the browser, by replacing the value of <code>client_id</code> value with the early saved value of
   <code>docu_sign_api_integration_key</code> field, and replace <code>redirect_uri</code> field value with early configured on the previous step.
   ```
     https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=fc6851eb-e7ed-4689-ba65-652d2a271ad3&redirect_uri=https://docusign.com
   ```
   ![DocuSign](./images/ds-11.png)

   Click the <code>Accept</code> button.


*  Navigate back to early created application integration <code>TFE-UseCase-Testing</code>.

   ![DocuSign](./images/ds-12.png)

   Click the <code>EDIT</code> button.


*  Changes required on Authentication; Select the <code>Implicit Grant</code> radio button

   ![DocuSign](./images/ds-14.png)


Click the <code>Save</code> button.

### Event Notification from DocuSign
Event notification will give possible to receive different events after doing operations with documents from DocuSign.

* Navigate to <code>Settings -> INTEGRATIONS -> Connect</code>

  ![DocuSign](./images/ds-1.png)

* Add new configuration by clicking on the button <code>ADD CONFIGURATION</code> selecting <code>Custom</code>
  from drop-down list.

  ![DocuSign](./images/ds-2.png)

  Following form will be displayed in order ful-fill required information.
  WebHook where the events will be received is configured under "URL to Publish (HTTPS required)" fields, this format should be used:
  https://successfactors-middleware.X-XXXXXX.kyma.shoot.live.k8s-hana.ondemand.com/webhook/docusign

  As example used on this PoC:

  ![DocuSign](./images/ds-3.png)

  IMPORTANT: The PoC doesn't have any security in place for DocuSign WebHook, but for production should be use
  security mechanism according to what DocuSign si or will support at time of implemented.

  For your specific use case select the type of events, as well you can enable Authentication.</br>
  At the end <code>Save</code> the changes.

### Templates on DocuSign
DocuSign is operating with templates, which the application will full fill the information and sent to signer.

Clone locally the [source code](https://github.tools.sap/btp-use-case-factory/successfactors-docusign-extension).
Go to deployment folder and use <code>DocuSignTemplates_Job Title Updated.zip</code> file as template.

* Navigate to <code>Templates</code>

  ![DocuSign](./images/ds-15.png)

* Upload an existent prepared template, click on <code>NEW -> Upload Templates</code> button, and
  select <code>DocuSignTemplates_Job Title Updated.zip</code> file.

  ![DocuSign](./images/ds-16.png)

  On a successful upload the <code>Job Title Updated</code> template should be in your list.

  ![DocuSign](./images/ds-17.png)

* Select uploaded/created template and click on <code>Template ID</code>

  ![DocuSign](./images/ds-18.png)

  Collect the Template Id UUID value and save into a temporary file
   ```
    docu_sign_template_id: dc69433b-8886-4a32-b3f2-4b8e93d8c222
   ```
  ![DocuSign](./images/ds-19.png)


## Application Configurations

Clone locally the [source code](https://github.tools.sap/btp-use-case-factory/successfactors-docusign-extension).
Go to deployment folder and replace following lines into files:

* Update following file content <code>101-successfactors-middleware-conf.yaml</code>
    ```bash
      sf_url: "https://apisalesdemo2.successfactors.eu" // API endpoint of your SuccessFactors account
      docu_sign_signer_email: "<your email>" // Your Name 
      docu_sign_signer_name: "<your full name>" // Your Email Address 
      docu_sign_base_url: "https://demo.docusign.net/restapi" // Base Url of DocuSign account
      docu_sign_ouath_base_url: "account-d.docusign.com" // OAuth Base Url of your DocuSign account
      docu_sign_ouath_scopes: "signature impersonation" // OAuth Scopes
      docu_sign_template_id: "dc69433b-8886-4a32-b3f2-4b8e93d8c222"  // ID of your DocuSign template
      docu_sign_account_id: "022d968e-5d22-42a3-95bc-9724d0a66703"   // Collected During after getting the Docusign Account
      docu_sign_api_integration_key: "7f511a91-c3e0-4050-91db-cde40620fe4a" // Collected once done the Integration
      docu_sign_api_user_id: "6cbea6de-3593-4423-ba36-1f27da379c07" // Collected During after getting the Docusign Account
    ```

* Update following file content <code>100-successfactors-middleware-sec.yaml</code>
    ```bash
      SF_USERNAME: <base64 encoded of SuccessFactors username, raw value should have the format '<username>@<SF Company Id>'>
      SF_PASSWORD: <base64 encoded of SuccessFactors password>
      DOCU_SIGN_API_PRIVATE_KEY: <base64 encoded of DocuSign early saved private key> // Received Private Key should be formated as a single string line, space should be used as separator
    ```

* Update following file content <code>103-successfactors-middleware-apirules.yaml</code>
    ```bash
      Replace 'XXXXXXXX' - with Kyma environment code
    ```

### Deployment
* Apply on Kubernetes the manifest files

  ```bash
    kubectl apply -n default -f ./deployments/prep/
    kubectl apply -n default -f ./deployments/
  ```

### Secure the WebHook Endpoints
WebHook Endpoint used to receive events from SAP SuccessFactors should be secured with OAuth2.

- Navigate to Kyma Dashboard, on <code>OAuth Clients</code> left menu.

  ![Kyma OAuth2](./images/kyma-4.png)

- Create new OAuth Client by clicking the button <code>+ New OAuth Client</code> from the right of the screen.

  ![Kyma OAuth2](./images/kyma-5.png)

  Click the <code>Create</code> button, after you should se it into the list.

  ![Kyma OAuth2](./images/kyma-6.png)

- Select created OAuth Client and click the <code>Decode</code> button, and collect the decoded Scope, ClientId & Client Secret.
  As Token Endpoint, this format should be used: https://oauth2.X-XXXXXX.kyma.shoot.live.k8s-hana.ondemand.com/oauth2/token
  Will require to be used on SAP SuccessFactors for Event Notification Authentication.
