# Lab 6: Load Balancer and Traffic Manager


Lab files: 

-  **06-lb_tm/files/az-101-03_01_azuredeploy.json**

-  **06-lb_tm/files/az-101-03_01_1_azuredeploy.parameters.json**

-  **06-lb_tm/files/az-101-03_01_2_azuredeploy.parameters.json**

### Objectives
  
After completing this lab, you will be able to:

-  Deploy Azure VMs by using Azure Resource Manager templates

-  Implement Azure Load Balancing

-  Implement Azure Traffic Manager load balancing


### Exercise 0: Deploy Azure VMs by using Azure Resource Manager templates
  
The main tasks for this exercise are as follows:

1. Deploy management Azure VMs running Windows Server 2022 Datacenter with the Web Server (IIS) role installed into an availability set in the first Azure region by using an Azure Resource Manager template

1. Deploy management Azure VMs running Windows Server 2022 Datacenter with the Web Server (IIS) role installed into an availability set in the second Azure region by using an Azure Resource Manager template



#### Task 1: Deploy management Azure VMs running Windows Server 2022 Datacenter with the Web Server (IIS) role installed into an availability set in the first Azure region by using an Azure Resource Manager template

1. In the Azure portal, navigate to the **Create a resource** blade.

1. From the **Create a resource** blade, search Azure Marketplace for **Template deployment**.

1. Use the list of search results to navigate to the **Deploy a custom template** blade.

1. On the **Custom deployment** blade, click the **Build your own template in the editor** link. 

1. From the **Edit template** blade, load the template file **06-lb_tm/files/az-101-03_01_azuredeploy.json**. 

> **Note**: Review the content of the template and note that it defines deployment of two Azure VMs hosting Windows Server 2022 Datacenter Core into an availability set.  

1. Save the template and return to the **Custom deployment** blade. 

1. From the **Custom deployment** blade, navigate to the **Edit parameters** blade.

1. From the **Edit parameters** blade, load the parameters file **06-lb_tm/files/az-101-03_01_1_azuredeploy.parameters.json**. 

1. Save the parameters and return to the **Custom deployment** blade. 

1. From the **Custom deployment** blade, initiate a template deployment with the following settings:

- Subscription: the name of the subscription you intend to use in this lab

- Resource group: the name of a new resource group **az1010301-RG**

- Location: **West US 2**

- Admin Username: **Student**

- Admin Password: **Pa55w.rd1234**

- Vm Name Prefix: **az1010301w-vm**

- Nic Name Prefix: **az1010301w-nic**

- Image Publisher: **MicrosoftWindowsServer**

- Image Offer: **WindowsServer**

- Image SKU: **2022-Datacenter**

- Vm Size: use **Standard_B1ms** 

- Virtual Network Name: **az1010301-vnet**

- Address Prefix: **10.101.31.0/24**

- Virtual Network Resource Group: **az1010301-RG**

- Subnet0Name: **subnet0**

- Subnet0Prefix: **10.101.31.0/26**

- Availability Set Name: **az1010301w-avset**

- Network Security Group Name: **az1010301w-vm-nsg**

> **Important Step:**
>
> 1. **Create a new PowerShell DSC script named `ContosoWebsite.ps1`** with the following content:
>
>    ```powershell
>    configuration ContosoWebsite {
>        param (
>             [Parameter(Mandatory=$true)]
>            [string]$NodeName
>        )
>
>        Import-DscResource -ModuleName PSDesiredStateConfiguration
>
>        Node $NodeName {
>            WindowsFeature IIS {
>                Name = "Web-Server"
>                Ensure = "Present"
>            }
>
>            File DefaultPage {
>                Ensure = "Present"
>                DestinationPath = "C:\\inetpub\\wwwroot\\Default.htm"
>                Contents = "Hello from Contoso's IIS VM!"
>                Type = "File"
>                Force = $true
>                DependsOn = "[WindowsFeature]IIS"
>            }
>        }
>    }
>    ```
>
> 2. **Zip the file** and name it `ContosoWebsite.ps1.zip`.
>
> 3. **Upload the ZIP file to a new public Azure Blob Storage container**:
>
>    * Create a new Storage Account.
>    * Create a Blob container (e.g. `scripts`) with **Public Access Level: Blob (anonymous read access)**.
>    * Upload `ContosoWebsite.ps1.zip`.
>    * Copy the blob URL and use it as the value for `Modules Url` in your parameters file.
>
>    Example:
>
>    ```json
>    "modulesUrl": {
>      "value": "https://<your-storage-account>.blob.core.windows.net/scripts/ContosoWebsite.ps1.zip"
>    }
>    ```


- Modules Url: **https://<your-storage-account>.blob.core.windows.net/scripts/ContosoWebsite.ps1.zip**

- Configuration Function: **ContosoWebsite.ps1\\ContosoWebsite**
- Click on **Review + create** then click **Create**

> **Note**: Do not wait for the deployment to complete but proceed to the next task.   


#### Task 2: Deploy management Azure VMs running Windows Server 2022 Datacenter with the Web Server (IIS) role installed into an availability set in the second Azure region by using an Azure Resource Manager template

1. In the Azure portal, navigate to the **Create a resource** blade.

1. From the **Create a resource** blade, search Azure Marketplace for **Template deployment**.

1. Use the list of search results to navigate to the **Deploy a custom template** blade.

1. On the **Custom deployment** blade, click the **Build your own template in the editor** link. 

1. From the **Edit template** blade, load the template file **06-lb_tm/files/az-101-03_01_azuredeploy.json**. 

> **Note**: This is the same template you used in the previous task. You will use it to deploy a pair of Azure VMs to the second region.   

1. Save the template and return to the **Custom deployment** blade. 

1. From the **Custom deployment** blade, navigate to the **Edit parameters** blade.

1. From the **Edit parameters** blade, load the parameters file **06-lb_tm/files/az-101-03_01_2_azuredeploy.parameters.json**. 

1. Save the parameters and return to the **Custom deployment** blade. 

1. From the **Custom deployment** blade, initiate a template deployment with the following settings:

- Subscription: the name of the subscription you are using in this lab

- Resource group: the name of a new resource group **az1010302-RG**

- Location: **East US**

- Admin Username: **Student**

- Admin Password: **Pa55w.rd1234**

- Vm Name Prefix: **az1010302w-vm**

- Nic Name Prefix: **az1010302w-nic**

- Image Publisher: **MicrosoftWindowsServer**

- Image Offer: **WindowsServer**

- Image SKU: **2022-Datacenter**

- Vm Size: use **Standard_B1ms**

- Virtual Network Name: **az1010302-vnet**

- Address Prefix: **10.101.32.0/24**

- Virtual Network Resource Group: **az1010302-RG**

- Subnet0Name: **subnet0**

- Subnet0Prefix: **10.101.32.0/26**

- Availability Set Name: **az1010302w-avset**

- Network Security Group Name: **az1010302w-vm-nsg**

- Modules Url: **https://<your-storage-account>.blob.core.windows.net/scripts/ContosoWebsite.ps1.zip**

- Configuration Function: **ContosoWebsite.ps1\\ContosoWebsite**

> **Note**: Do not wait for the deployment to complete but proceed to the next exercise.  

> **Result**: After you completed this exercise, you have used Azure Resource Manager templates to initiate deployment of Azure VMs running Windows Server 2022 Datacenter with the Web Server (IIS) role installed into availability sets in two Azure regions.  


### Exercise 1: Implement Azure Load Balancing
  
The main tasks for this exercise are as follows:

1. Implement Azure load balancing rules in the first region.

1. Implement Azure load balancing rules in the second region.

1. Implement Azure NAT rules in the first region.

1. Implement Azure NAT rules in the second region.

1. Verify Azure load balancing and NAT rules

```bash
az vm extension set \
  --publisher Microsoft.Powershell \
  --version 2.83 \
  --name DSC \
  --vm-name az1010301w-vm0 \
  --resource-group az1010301-RG \
  --settings '{
    "modulesUrl": "https://fstorage100.blob.core.windows.net/scripts/ContosoWebsite.ps1.zip",
    "configurationFunction": "ContosoWebsite.ps1\\ContosoWebsite",
    "properties": {
      "NodeName": "localhost"
    }
  }'
```
---
#### Task 1: Implement Azure load balancing rules in the first region

> **Note**: Before you start this task, ensure that the template deployment you started in the first task of the previous exercise has completed.   

1. In the Azure portal, navigate to the **Create a resource** blade.

1. From the **Create a resource** blade, search Azure Marketplace for **Load Balancer**.

1. Use the list of search results to navigate to the **Create load balancer** blade.

1. From the **Create load balancer** blade, create a new Azure Load Balancer with the following settings:

- Subscription: the name of the subscription you are using in this lab

- Resource group: **az1010301-RG**
    
- Name: **az1010301w-lb**

- Region: **West US 2**

- Type: **Public**

- SKU: **Standard**
- Create a new **Frontend IP Configuration**

- Public IP address: a new public IP address named **az1010301w-lb-pip**

- Click **SAVE**

- Click **Review + create** and then **Create**

1. In the Azure portal, navigate to the blade of the newly deployed Azure load balancer **az1010301w-lb**.

2. From the **az1010301w-lb** blade, display the **az1010301w-lb - Backend pools** under the **Settings** blade.

3. From the **az1010301w-lb - Backend pools** blade, add a backend pool with the following settings:

- Name: **az1010301w-bepool**

- Virtual network: **az1010301-vnet**

- IP address: **10.101.31.4**

- IP address: **10.101.31.5**
    
- Click **Save**

> **Note**: It is possible that the IP addresses of the Azure VMs are assigned in the reverse order.   

> **Note**: Wait for the operation to complete. This should take less than a minute.  

1. From the **az1010301w-lb - Backend pools** blade, display the **az1010301w-lb - Health probes** blade.

2. From the **az1010301w-lb - Health probes** blade, add a health probe with the following settings:

- Name: **az1010301w-healthprobe**

- Protocol: **TCP**

- Port: **80**

- Interval: **5** seconds


> **Note**: Wait for the operation to complete. This should take less than a minute.  

1. From the **az1010301w-lb - Load balancing rules** blade, add a load balancing rule with the following settings:

- Name: **az1010301w-lbrule01**

- IP Version: **IPv4**

- Frontend IP address: **LoadBalancerFrontEnd**

- Protocol: **TCP**

- Port: **80**

- Backend port: **80**

- Backend pool: **az1010301w-bepool (2 virtual machines)**

- Health probe: **az1010301w-healthprobe (TCP:80)**

- Session persistence: **None**

- Idle timeout (minutes): **4**

- Floating IP: **Disabled**

---

#### Task 2: Implement Azure load balancing rules in the second region

> **Note**: Before you start this task, ensure that the template deployment you started in the second task of the previous exercise has completed.   

1. In the Azure portal, navigate to the **Create a resource** blade.

1. From the **Create a resource** blade, search Azure Marketplace for **Load Balancer**.

1. Use the list of search results to navigate to the **Create load balancer** blade.

1. From the **Create load balancer** blade, create a new Azure Load Balancer with the following settings:

- Subscription: the name of the subscription you are using in this lab
    
- Resource group: **az1010302-RG**

- Name: **az1010302w-lb**
    
- Region: **East US**

- Type: **Public**

- SKU: **Standard**

- Add a new **Frontend IP configuration** and a new public IP address named **az1010302w-lb-pip**

- Click **Save**
    
- Click **Review + create** and then **Create**


1. In the Azure portal, navigate to the blade of the newly deployed Azure load balancer **az1010302w-lb**.

2. From the **az1010302w-lb** blade, display the **az1010302w-lb - Backend pools** blade.

3. From the **az1010302w-lb - Backend pools** blade, add a backend pool with the following settings:

- Name: **az1010302w-bepool**

- Virtual Network: **az1010302-vnet**

- Backend Pool Configuration: **IP Address** 

- IP address: **10.101.32.4**

- IP address: **10.101.32.5**
- Click **Save**

> **Note**: It is possible that the IP addresses of the Azure VMs are assigned in the reverse order.   

> **Note**: Wait for the operation to complete. This should take less than a minute.  


1. From the **az1010302w-lb - Health probes** blade, add a health probe with the following settings:

- Name: **az1010302w-healthprobe**

- Protocol: **TCP**

- Port: **80**

- Interval: **5** seconds

- Click **Save**

> **Note**: Wait for the operation to complete. This should take less than a minute.  

1. From the **az1010302w-lb - Load balancing rules** blade, add a load balancing rule with the following settings:

- Name: **az1010302w-lbrule01**

- IP Version: **IPv4**

- Frontend IP address: **LoadBalancerFrontEnd**
- Backend Pool: **az1010302w-bepool**

- Protocol: **TCP**

- Port: **80**

- Backend port: **80**

- Health probe: **az1010302w-healthprobe (TCP:80)**

- Session persistence: **None**

- Idle timeout (minutes): **4**

- Enable Floating IP: **Disabled**
- Click **Save**

---

#### Task 3: Implement Azure NAT rules in the first region

1. In the Azure portal, navigate to the blade of the Azure load balancer **az1010301w-lb**.

1. From the **az1010301w-lb** blade, display the **az1010301w-lb - Inbound NAT rules** blade.

> **Note**: The NAT functionality does not rely on health probes.  

1. From the **az1010301w-lb - Inbound NAT rules** blade, add the first inbound NAT rule with the following settings:

- Name: **az1010301w-vm0-RDP**
- Target virtual machine: **az1010301w-vm0**
- Network IP configuration: **ipconfig1 (10.101.31.4)** or **ipconfig1 (10.101.31.5)**
- Frontend IP address: **LoadBalancerFrontEnd**
- Frontend Port: **33890**
- Service Tag: **Custom**
- Backend port: **3389**
- Protocol: **TCP**
- Enable Floating IP: **Disabled**
- Click **Save**
  
> **Note**: Wait for the operation to complete. This should take less than a minute.  

1. From the **az1010301w-lb - Inbound NAT rules** blade, add the second inbound NAT rule with the following settings:

- Name: **az1010301w-vm1-RDP**
- Target virtual machine: **az1010301w-vm1**
- Network IP configuration: **ipconfig1 (10.101.31.4)** or **ipconfig1 (10.101.31.5)**
- Frontend IP address: **LoadBalancerFrontEnd**
- Frontend Port: **33891**
- Service Tag: **Custom**
- Backend port: **3389**
- Protocol: **TCP**
- Enable Floating IP: **Disabled**
- Click **Save**

> **Note**: Wait for the operation to complete. This should take less than a minute.  

---

#### Task 4: Implement Azure NAT rules in the second region

1. In the Azure portal, navigate to the blade of the Azure load balancer **az1010302w-lb**.

1. From the **az1010302w-lb** blade, display the **az1010302w-lb - Inbound NAT rules** blade.

1. From the **az1010302w-lb - Inbound NAT rules** blade, add the first inbound NAT rule with the following settings:

- Name: **az1010302w-vm0-RDP**
- Target virtual machine: **az1010302w-vm0**
- Network IP configuration: **ipconfig1 (10.101.32.4)** or **ipconfig1 (10.101.32.5)**
- Frontend IP address: **LoadBalancerFrontEnd**
- Frontend Port: **33890**
- Service Tag: **Custom**
- Backend port: **3389**
- Protocol: **TCP**
- Enable Floating IP: **Disabled**
- Click **Save**

> **Note**: Wait for the operation to complete. This should take less than a minute.  

1. From the **az1010302w-lb - Inbound NAT rules** blade, add the second inbound NAT rule with the following settings:

- Name: **az1010302w-vm1-RDP**
- Target virtual machine: **az1010302w-vm1**
- Network IP configuration: **ipconfig1 (10.101.32.4)** or **ipconfig1 (10.101.32.5)**
- Frontend IP address: **LoadBalancerFrontEnd**
- Frontend Port: **33891**
- Service Tag: **Custom**
- Backend port: **3389**
- Protocol: **TCP**
- Enable Floating IP: **Disabled**
- Click **Save**

> **Note**: Wait for the operation to complete. This should take less than a minute.  


#### Task 5: Verify Azure load balancing and NAT rules.

1. In the Azure portal, navigate to the blade of the Azure load balancer **az1010301w-lb**.

1. On the **az1010301w-lb** Frontend IP configuration blade, identify the public IP address assigned to the load balancer frontend.

1. Browse to the IP address you identified in the previous step.

1. Verify that the tab displays the default Internet Information Services home page.

1. Close the browser tab displaying the default Internet Information Services home page.


> **Note**: Repeat the same tests for the second region.  

> **Result**: After you completed this exercise, you have implemented load balancing rules and NAT rules of Azure in two Azure regions and verified load balancing rules and NAT rules of Azure load balancers in the first region.  

---

### Exercise 2: Implement Azure Traffic Manager load balancing

The main tasks for this exercise are as follows:

1. Assign DNS names to public IP addresses of Azure load balancers

1. Implement Azure Traffic Manager load balancing

1. Verify Azure Traffic Manager load balancing

---

#### Task 1: Assign DNS names to public IP addresses of Azure load balancers

> **Note**: This task is necessary because each Traffic Manager endpoint must have a DNS name assigned.   

1. In the Azure portal, navigate to the blade of the public IP address resource associated with the Azure load balancer in the first region named **az1010301w-lb-pip**. 

1. From the **az1010301w-lb-pip** blade, display its **Configuration** blade. 

1. From the **az1010301w-lb-pip - Configuration** blade set the **DNS name label** of the public IP address to a unique value. 

> **Note**: The green check mark in the **DNS name label (optional)** text box will indicate whether the name you typed in is valid and unique.   

1. Click **Save** at the top to apply DNS entry.

1. Navigate to the blade of the public IP address resource associated with the Azure load balancer in the second region named **az1010302w-lb-pip**. 

1. From the **az1010302w-lb-pip** blade, display its **Configuration** blade. 

1. From the **az1010302w-lb-pip - Configuration** blade set the **DNS name label** of the public IP address to a unique value. 

> **Note**: The green check mark in the **DNS name label (optional)** text box will indicate whether the name you typed in is valid and unique.   

1. Click **Save** at the top to apply DNS entry.

---

#### Task 2: Implement Azure Traffic Manager load balancing

1. In the Azure portal, navigate to the **Create a resource** blade.

1. From the **Create a resource** blade, search Azure Marketplace for **Traffic Manager profile**.

1. Use the list of search results to navigate to the **Create Traffic Manager profile** blade.

1. From the **Create Traffic Manager profile** blade, create a new Azure Traffic Manager profile with the following settings:

- Name: a globally unique name in the trafficmanager.net DNS namespace

- Routing method: **Weighted**

- Subscription: the name of the subscription you are using in this lab

- Resource group: the name of a new resource group **az1010303-RG**

- Location: either of the Azure regions you used earlier in this lab

- Click **Create** to apply changes

1. In the Azure portal, navigate to the blade of the newly provisioned Traffic Manager profile.

1. From the Traffic Manager profile blade, display its **Configuration** blade under settings.

> **Note**: The default TTL of the Traffic Manager profile DNS records is 60 seconds  

1. From the Traffic Manager profile blade, display its **Endpoints** blade.

1. From the **Endpoints** blade, add the first endpoint with the following settings:

- Type: **Azure endpoint**

- Name: **az1010301w-lb-pip**

- Target resource type: **Public IP address**

- Target resource: **az1010301w-lb-pip**

- Weight: **100**

- Custom Header settings: leave blank

- Add as disabled: leave blank

Click **OK** to apply changes

1. From the **Endpoints** blade, add the second endpoint with the following settings:

- Type: **Azure endpoint**

- Name: **az1010302w-lb-pip**

- Target resource type: **Public IP address**

- Target resource: **az1010302w-lb-pip**

- Weight: **100**

- Custom Header settings: leave blank

- Add as disabled: leave blank
    
- Click **OK** to apply changes

1. On the **Endpoints** blade, examine the entries in the **MONITORING STATUS** column for both endpoints. Wait until both are listed as **Online** before you proceed to the next task.

---

#### Task 3: Verify Azure Traffic Manager load balancing

1. From the **Endpoints** blade, switch to the **Overview** section of the Traffic Manager profile blade.

1. Note the DNS name assigned to the Traffic Manager profile (the string following the **http://** prefix). 

1. From the Azure Portal, start a Bash session in the Cloud Shell pane. 

 
1. In the Cloud Shell pane, run the following command, replacing the &lt;TM_DNS_name&lt; placeholder with the value of the DNS name assigned to the Traffic Manager profile you identified in the previous task, making sure to remove `http://`:

   ```
   nslookup <TM_DNS_name>.<region_name>.cloudapp.azure.com
   ```

1. Review the output and note the **Name** entry. This should match the DNS name of the one of the Traffic Manager profile endpoints you created in the previous task.

1. Wait for at least 60 seconds and run the same command again:

   ```
   nslookup <TM_DNS_name>.<region_name>.cloudapp.azure.com
   ```
1. Review the output and note the **Name** entry. This time, the entry should match the DNS name of the other Traffic Manager profile endpoint you created in the previous task.

> **Result**: After you completed this exercise, you have implemented and verified Azure Traffic Manager load balancing  

---

## Exercise 3: Remove lab resources

#### Task 1: Open Cloud Shell

1. At the top of the portal, click the **Cloud Shell** icon to open the Cloud Shell pane.

1. At the Cloud Shell interface, select **Bash**.

1. At the **Cloud Shell** command prompt, type in the following command and press **Enter** to list all resource groups you created in this lab:

```sh
az group list --query "[?starts_with(name,'az101030')].name" --output tsv
```

1. Verify that the output contains only the resource groups you created in this lab. These groups will be deleted in the next task.

#### Task 2: Delete resource groups

1. At the **Cloud Shell** command prompt, type in the following command and press **Enter** to delete the resource groups you created in this lab

```sh
az group list --query "[?starts_with(name,'az101030')].name" --output tsv | xargs -L1 bash -c 'az group delete --name $0 --no-wait --yes'
```

1. Close the **Cloud Shell** prompt at the bottom of the portal.

> **Result**: In this exercise, you removed the resources used in this lab.  
