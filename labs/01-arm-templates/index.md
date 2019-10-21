# Lab1: ARM templates
In this lab we will create an Azure Resource manager template, we will then separate out our some component resources by linking templates to modularize the resources. We will then modify the main deployment template to call the linked template and updated dependencies, and finally deploy the templates to Azure.

## Lab Tasks:
- Task 1: Create Resource Manager template
- Task 2: Create a Linked template for storage resources
- Task 3: Upload Linked Template to Azure Blob Storage and generate SAS token
- Task 4: Modify the main template to call Linked template
- Task 5: Modify main template to update dependencies
- Task 6: Deploy resources to Azure using linked templates


<h3> Estimated Lab Time:</h3>
- approx. 45 minutes

### Optional: 
It is not required but a great editor for Mac or Windows is Visual Studio Code. If you'd like to use download from here https://code.visualstudio.com

The labs will be shown running in Visual Studio Code but you can always substitute for `vim` or your favorite editor. 

### Task 1: Create Resource Manager template

Start by cloning the class repo: 
```
git clone https://github.com/jruels/adv-azure-classpage.git
```

In the `labs/01-arm-templates` directory you will find all the required files for this lab. 

1. In **Visual Studio Code**, go to **File** > **Preferences** > **Extensions** and in the search box type **Azure Resource Manager** tools install the  <a href="https://marketplace.visualstudio.com/items?itemName=msazurermtools.azurerm-vscode-tools" target="_blank"><span style="color: 0066cc">Azure Resource Manager Tools</span></a>
![](index/vsc_resmgtext.png)
  
2. 
    Rather than creating a template from scratch we will use one of the <a href="https://azure.microsoft.com/en-us/resources/templates/" target="_blank"><span style="color: 0066cc">Azure Quickstart Templates</span></a>. We will use a template designed to Deploy a simple Windows  VM.

3. Create a working directory to keep your templates in and copy `01/arm-templates/azuredeploy.json` to your new working directory. 

4. Copy `<your_dir>/azuredeploy.json` to  `<your_dir>/storage/storage.json`

You should now have two identital json files   

- `$WORKINGDIR/azuredeploy.json`   
- `$WORKINGDIR/storage/storage.json`   

5. Open `azuredeploy.json` in an editor to get a better understanding of the structure. There are five *resources* defined in the template:

- Microsoft.Storage/storageAccounts. 
- Microsoft.Network/publicIPAddresses. 
- Microsoft.Network/virtualNetworks.
- Microsoft.Network/networkInterfaces. 
- Microsoft.Compute/virtualMachines.

### Task 2: Create a Linked template for storage resources

The linked storage template we are creating, `storage.json` will create a storage account. The linked storage template needs to pass a value back to the main template, a`zuredeploy.json`, and this value is defined in the `outputs` element of the linked storage template.

1. Open `storage.json` in your editor. Ensure it is the storage.json that is open and **not** the `azuredeploy.json`.

2. In the `storage.json`, remove all the resource element except the `storageAccounts` resource. It should result in a resource section looking like the below.

```json
      "resources": [
        {
          "type": "Microsoft.Storage/storageAccounts",
          "name": "[variables('storageAccountName')]",
          "location": "[parameters('location')]",
          "apiVersion": "2018-07-01",
          "sku": {
            "name": "Standard_LRS"
          },
          "kind": "Storage",
          "properties": {}
        }
```

![](index/linkedtemplatestorage1.png)
 
3. Rename the `name` element of storageAccount from `variables` to `parameters`

```json
"resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "name": "[parameters('storageAccountName')]",
      "location": "[parameters('location')]",
      "apiVersion": "2018-07-01",
      "sku": {
        "name": "Standard_LRS"
      },
      "kind": "Storage",
      "properties": {}
    }
    ```
```

4. Next, remove the `variables` section and all variable definitions, as highlighted below,
![](index/linkedtemplatestorage2.png)

5. Next, remove all `parameter` values except **location** and add the following parameter code. It should end up looking as in the screenshot below.
```json
"storageAccountName":{
    "type": "string",
    "metadata": {
        "description": "Azure Storage account name."
    }
    },
```

![](index/linkedtemplatestorage4.png)

6. Next, update the `output` section to define a `storageURI` output value. The `storageUri` value is required by the virtual machine resource definition in the main template. You pass the value back to the main template as an output value. Modify the output so it looks like the below.

```json
"outputs": {
        "storageUri": {
            "type": "string",
            "value": "[reference(parameters('storageAccountName')).primaryEndpoints.blob]"
          }
    }
```

![](index/linkedtemplatestorage5.png)

7. Save the storage.json template. The linked storage template should now look like the below,

```json
{
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
        "storageAccountName":{
          "type": "string",
          "metadata": {
            "description": "Azure Storage account name."
          }
        },
        "location": {
          "type": "string",
          "defaultValue": "[resourceGroup().location]",
          "metadata": {
            "description": "Location for all resources."
          }
        }
      },
      "resources": [
        {
          "type": "Microsoft.Storage/storageAccounts",
          "name": "[parameters('storageAccountName')]",
          "apiVersion": "2016-01-01",
          "location": "[parameters('location')]",
          "sku": {
            "name": "Standard_LRS"
          },
          "kind": "Storage",
          "properties": {}
        }
      ],
      "outputs": {
          "storageUri": {
              "type": "string",
              "value": "[reference(parameters('storageAccountName')).primaryEndpoints.blob]"
            }
      }
    }
    
```

### Task 3: Upload Linked Template to Azure Blob Storage and generate SAS token
When linking to a template, the Azure Resource Manager service must be able to access it. As such You **cannot** specify a local file or a file that is only available on your local network. You can only provide a URI value that includes either `http` or `https`.

In order to achieve this we will upload our linked storage template, `storage.json`, to blob storage in Azure. Then we will generate a url that we can then use to access it.

We will perform these steps in Azure Cloud Shell for ease of use. You could also manually create a blob container via the Azure Portal, upload the file and generate a URL for the following PowerShell script. 

1. Open the Azure Cloud Shell via http://shell.azure.com
2. Log into Azure Cloud 
3. Switch the Azure Cloud Shell to a **PowerShell** command line.

4. The below is a PowerShell script, that will create a blob storage container, upload our template file and generate a URL with a SAS token that we can call in our main template. Have a read through the below to understand what it is doing. When you are ready copy and paste the below into the **Azure Cloud Shell** and enter values as prompted.

**Note**: Ensure you note the value that are output at the end of the script, as they will be required later in the lab.

```powershell
$projectNamePrefix = Read-Host -Prompt "Enter a project name (no spaces or special characters):"   # This name is used to generate names for Azure resources, such as storage account name.
    $location = Read-Host -Prompt "Enter a location (i.e. centralus or westus)" 
    
    $resourceGroupName = $projectNamePrefix + "rg"
    $storageAccountName = $projectNamePrefix + "stracc"
    $containerName = "linktempblobcntr" # The name of the Blob container to be created.
    
    $linkedTemplateURL = "https://raw.githubusercontent.com/jruels/adv-azure-classpage/master/labs/01-arm-templates/.solutions/storage.json" # A completed linked template used in this lab.
    $fileName = "storage.json" # A file name used for downloading and uploading the linked template.
    
    # Download the lab linked template
    Invoke-WebRequest -Uri $linkedTemplateURL -OutFile "$home/$fileName" # This generates a copy of the storage.json template in your Azure Cloud Shell session
    
    # Create a resource group
    New-AzResourceGroup -Name $resourceGroupName -Location $location # creates a new resource group into which we create a storage account, then a blob container
    
    # Create a storage account
    $storageAccount = New-AzStorageAccount `
        -ResourceGroupName $resourceGroupName `
        -Name $storageAccountName `
        -Location $location `
        -SkuName "Standard_LRS"
    
    $context = $storageAccount.Context
    
    # Create a container
    New-AzureStorageContainer -Name $containerName -Context $context
    
    
    # Upload the linked template
    Set-AzureStorageBlobContent `
        -Container $containerName `
        -File "$home/$fileName" `
        -Blob $fileName `
        -Context $context
    
    # Generate a SAS token. We set an expiry time of 24 hours, but you could have shorter values for increased security.
    $templateURI = New-AzureStorageBlobSASToken `
        -Context $context `
        -Container $containerName `
        -Blob $fileName `
        -Permission r `
        -ExpiryTime (Get-Date).AddHours(24.0) `
        -FullUri
    
    echo "You need the following values later in the tutorial :"
    echo "Resource Group Name: $resourceGroupName"
    echo "Linked template URI with SAS token: $templateURI"
    echo "finished"
```

5. Note the output values after PowerShell completes, they should look similar to:

- **$resourcegroupName**: `advazurejrsrg`
- **$templateURI**:
```
https://lnkedtempprojstracc.blob.core.windows.net/linktempblobcntr/storage.json?sv=2018-03-28&sr=b&sig=B4hDLt9rFaWHZXToJlMwMjejAQGT7x0INdDR9bHBQnI%3D&se=2019-02-05T10%3A09%3A48Z&sp=r`
```

For scenarios requiring more security we could configure the main template to generate a SAS token when the template is being run, and give the SAS token expiry a smaller window to make it more secure. You can see the [Deploy private Resource Manager template with SAS token and Azure PowerShell](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-powershell-sas-token#provide-sas-token-during-deployment) page for more details on how to do this.

### Task 4: Modify the main template to call linked template

To account for the changes we made to the templates structure by modularizing all the storage elements, we now need to modify the main template to call the new storage  resource definition.

1. In your editor open the main template `azuredeploy.json`
2. In the `resource` section remove the `storage` resource element

```json
{
      "type": "Microsoft.Storage/storageAccounts",
      "name": "[variables('storageAccountName')]",
      "location": "[parameters('location')]",
      "apiVersion": "2018-07-01",
      "sku": {
        "name": "Standard_LRS"
      },
      "kind": "Storage",
      "properties": {}
    },
```

![](index/linkedmaintemplate1.png)

3. Next, add the following code to the `resources` section where the storage element was that you just deleted.

**Note**: Ensure to paste in the `$templateURI` value that you obtained when you uploaded the linked `storage.json` to blob storage earlier.

```json
{
      "name": "linkedTemplate",
      "type": "Microsoft.Resources/deployments",
      "apiVersion": "2018-05-01",
      "properties": {
          "mode": "Incremental",
          "templateLink": {
              "uri":"< enter the Template URI value you obtained earlier containing a SAS Token >"
          },
          "parameters": {
              "storageAccountName":{"value": "[variables('storageAccountName')]"},
              "location":{"value": "[parameters('location')]"}
          }
      }
    },
```

![](index/linkedmaintemplate3.png)

**Note** the following details from this section above:
		- A `Microsoft.Resources/deployments` resource in the main template is used to link to another template.
		- The `deployments` resource has a name called `linkedTemplate`. This name is used for configuring dependency. 
		- You can only use `Incremental` deployment mode when calling linked templates.
		- `templateLink/uri` contains the linked template URI. Update the value to the URI you get when you upload the linked template (the one with a SAS token).
		- Use `parameters` to pass values from the main template to the linked template.

4. Save the template.

### Task 5: Modify main template to update dependencies

1. Next, because the storage account is defined in the linked storage template now, we must update the following two elements of the `Microsoft.Compute/virtualMachines` resource definition. In the resource section in the virtual machines element, update the `dependOn` element to the below:

from
```json
"dependsOn": [
            "[resourceId('Microsoft.Storage/storageAccounts/', variables('storageAccountName'))]",
            "[resourceId('Microsoft.Network/networkInterfaces/', variables('nicName'))]"
```

to
```json
"dependsOn": [
            "linkedTemplate",
            "[resourceId('Microsoft.Network/networkInterfaces/', variables('nicName'))]"
```

![](index/linkedmaintemplate4.png)

2.  Still in the `resources` section under the `Microsoft.Compute/virtualMachines` element, reconfigure the `properties/diagnosticsProfile/bootDiagnostics/storageUri` element to the output value you defined in the linked storage template as below. This value is required by the main template

from
```json
"diagnosticsProfile": {
              "bootDiagnostics": {
                "enabled": true,
                "storageUri": "[reference(resourceId('Microsoft.Storage/storageAccounts/', variables('storageAccountName'))).primaryEndpoints.blob]"
              }
```

to
```json
"diagnosticsProfile": {
              "bootDiagnostics": {
                "enabled": true,
                "storageUri": "[reference('linkedtemplate').outputs.storageUri.value]"
              }
```

![](index/linkedmaintemplate5.png)

3. Save the updated main deployment template.

### Task 6: Deploy resources to Azure using linked templates
You can deploy templates using a variety of methods, including directly from the Azure Portal, or using Azure CLI or Powershell, locally, or via the Azure Cloud Shell. We will will use Azure CLI run from Azure Cloud Shell.

We need to ensure the main deployment template, `azuredeploy.json`, is accessible from the Azure Cloud Shell. We do that by uploading the `azuredeploy.json` to blob storage and obtaining the file URL. Then when running Azure CLI command we will use a `--template-uri` parameter.

Start by uploading `azuredeploy.json`  to blog storage. 

1. In the Azure Portal click **Storage accounts** on the blade and then on the new screen click on the storage account you created with the `PowerShell` script. 
![](index/azure-stor-account.png)

2. Click **Containers**
3. Create a new container and give it public access. 

![](index/A9E08C43-4626-4B97-8087-7F3A34DB0731.png)


4. Upload the updated `azuredeploy.json` to the new container and get the URL. 
5. Now open Azure CLI  and run the following 

```bash
az group deployment create --name < name for the deployment > --resource-group < resource group you created earlier when running PowerShell script >  --template-uri <URL for uploaded azuredeploy.json>
```

You will be prompted to enter values for:
* Username 
* Password
* DNS prefix 
You can choose whatever you'd like. 

**NOTE:** The process takes a while and doesn't seem to be progressing but if you go check in the Azure portal you'll see new resources being created including a new VM named `SimpleWinVM`

6. As a next step we could now proceed with modularizing the remaining resource definitions in our deployment template, such as our network and virtual machine resource definitions. A way to approach this would be to modularize based on dependencies. A diagram representing dependencies in the template we used is shown below.


![](index/templatedependencies.png)

### Cleanup 
Delete the newly created resource group to avoid incurring any additional charges. 

### Summary
In this lab you have:
* Created Resource Manager template by re-using a Quickstart template
* Created a linked template for storage resources by defining just storage definitions
* Uploaded the linked storage template to Azure Blob Storage and generated SAS token to be called by the main deployment template.
* Modified the main template to call linked template
* Modified main template to update dependencies
* Uploaded the main template to Azure Blog Storage 
* Deployed resources to Azure using AZ CLI 
