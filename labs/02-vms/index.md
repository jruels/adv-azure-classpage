# Lab2: VM Scale Sets
All tasks in this lab are performed from the Azure portal (including a PowerShell Cloud Shell session) except for Exercise 2 Task 2 and Exercise 2 Task 3, which include steps performed from a Remote Desktop session to an Azure VM

Lab files: 

-  **02-vms/files/azuredeploy.json**

-  **02-vms/files/azuredeploy.parameters.json**

-  **02-vms/files/install_iis_vmss.zip**

### Objectives

After completing this lab, you will be able to:

-  Deploy Azure VMs by using the Azure portal, Azure PowerShell, and Azure Resource Manager templates

-  Configure networking settings of Azure VMs running Windows and Linux operating systems

-  Deploy and configure Azure VM scale sets


### Exercise 1: Deploy Azure VMs by using the Azure portal, Azure PowerShell, and Azure Resource Manager templates

The main tasks for this exercise are as follows:

1. Deploy an Azure VM running Windows Server 2022 Datacenter into an availability set by using the Azure portal

1. Deploy an Azure VM running Windows Server 2022 Datacenter into the existing availability set by using Azure PowerShell

1. Deploy two Azure VMs running Linux into an availability set by using an Azure Resource Manager template


#### Task 1: Deploy an Azure VM running Windows Server 2022 Datacenter into an availability set by using the Azure portal

1. In the Azure portal, navigate to the **Create a resource** blade.

2. From the **Create a resource** blade, search Azure Marketplace for **Windows Server**. Select **Windows Server** from the search results list.

3. On the Windows Server page, use the drop-down menu to select **[smalldisk] Windows Server 2022 Datacenter**, and then click **Create**.

4. Use the **Create a virtual machine** blade to deploy a virtual machine with the following settings:

	- Subscription: the name of the subscription you are using in this lab

	- Resource group: the name of a new resource group **azscaleset-RG**

	- Virtual machine name: **azscaleset-vm0**

	- Region: **(US) East US** (or a region closer to you)

	> **Note**: To identify Azure regions where you can provision Azure VMs, refer to [**https://azure.microsoft.com/en-us/regions/offers/**](https://azure.microsoft.com/en-us/regions/offers/)    


	- Availability options: **Availability set**  
	
	- Availability set: Click **Create New**, and name the new availability set **azscaleset-avset0** with **2** fault domains and **5** update domains. Click **OK**.  
	- Security type: **Standard**
	
	- Image: **[smalldisk] Windows Server 2022 Datacenter**  
	
	- Size: **Standard DS1 v2**  
	
	- Username: **Student**  
	
	- Password: **Pa55w.rd1234**  
	
	- Public inbound ports: **None**
	
	- Would you like to use an existing Windows Server license?: **Leave default**

1. Click **Next: Disks >**.    

	- OS disk type: **Standard HDD**

1. Click **Next: Networking >**.

2. On the Networking tab, click **Create new** under Virtual Network. Enter `azscaleset-RG-vnet` for the virtual network name and specify the following:

	- Virtual network address range: **10.103.0.0/16**

	- Subnet name: **subnet0**

	- Subnet address range: **10.103.0.0/24**

3. Click **OK**.

4. Click **Next: Management > Monitoring >**.

5. On the Monitoring tab, review the default settings and note that boot diagnostics are turned on with a new diagnostics storage account automatically preconfigured.

6. Click **Next: Advanced >**.

7. On the Advanced tab, review the available settings.

8. Leave all settings with their default values, and click **Review + create**.

9. Click **Create**.

> **Note**: You will configure the network security group you create in this task in the second exercise of this lab  

> **Note**: Wait for the deployment to complete before you proceed to the next task. This should take about 5 minutes.  


#### Task 2: Deploy an Azure VM running Windows Server 2022 Datacenter into the existing availability set by using Azure PowerShell

1. From the Azure Portal, start a PowerShell session in the Cloud Shell pane. 

> **Note**: If this is the first time you are launching the Cloud Shell in the current Azure subscription, you will be asked to create an Azure file share to persist Cloud Shell files. If so, accept the defaults, which will result in creation of a storage account in an automatically generated resource group.  

1. In the Cloud Shell pane, run the following command:

```powershell
$vmName = 'azscaleset-vm1'
$vmSize = 'Standard_DS1_v2'
```

> **Note**: This sets the values of variables designating the Azure VM name and its size  

2. In the Cloud Shell pane, run the following commands:

```powershell
$resourceGroup = Get-AzResourceGroup -Name 'azscaleset-RG'
$location = $resourceGroup.Location
```

> **Note**: These commands set the values of variables designating the target resource group and its location  

3. In the Cloud Shell pane, run the following commands:

```powershell
$availabilitySet = Get-AzAvailabilitySet -ResourceGroupName $resourceGroup.ResourceGroupName -Name 'azscaleset-avset0'
$vnet = Get-AzVirtualNetwork -Name 'azscaleset-RG-vnet' -ResourceGroupName $resourceGroup.ResourceGroupName
$subnetid = (Get-AzVirtualNetworkSubnetConfig -Name 'subnet0' -VirtualNetwork $vnet).Id
```

> **Note**: These commands set the values of variables designating the availability set, virtual network, and subnet into which you will deploy the new Azure VM  

4. In the Cloud Shell pane, run the following commands:

```powershell
$nsg = New-AzNetworkSecurityGroup -ResourceGroupName $resourceGroup.ResourceGroupName -Location $location -Name "$vmName-nsg"
$pip = New-AzPublicIpAddress -Name "$vmName-ip" -ResourceGroupName $resourceGroup.ResourceGroupName -Location $location -AllocationMethod Static -Sku Standard 
$nic = New-AzNetworkInterface -Name "$($vmName)$(Get-Random)" -ResourceGroupName $resourceGroup.ResourceGroupName -Location $location -SubnetId $subnetid -PublicIpAddressId $pip.Id -NetworkSecurityGroupId $nsg.Id
```

> **Note**: These commands create a new network security group, public IP address, and network interface that will be used by the new Azure VM  

> **Note**: You will configure the network security group you create in this task in the second exercise of this lab  

5. In the Cloud Shell pane, run the following commands:

```powershell
$adminUsername = 'Student'
$adminPassword = 'Pa55w.rd1234'
$adminCreds = New-Object PSCredential $adminUsername, ($adminPassword | ConvertTo-SecureString -AsPlainText -Force)
```

> **Note**: These commands set the values of variables designating credentials of the local Administrator account of the new Azure VM  

6. In the Cloud Shell pane, run the following commands:

```powershell
$publisherName = 'MicrosoftWindowsServer'
$offerName = 'WindowsServer'
$skuName = '2022-Datacenter'
```

> **Note**: These commands set the values of variables designating the properties of the Azure Marketplace image that will be used to provision the new Azure VM  

7. In the Cloud Shell pane, run the following command:

```powershell
$osDiskType = (Get-AzDisk -ResourceGroupName $resourceGroup.ResourceGroupName)[0].Sku.Name
```

> **Note**: This command sets the values of a variable designating the operating system disk type of the new Azure VM  

8. In the Cloud Shell pane, run the following commands:

```powershell
$vmConfig = New-AzVMConfig -VMName $vmName -VMSize $vmSize -AvailabilitySetId $availabilitySet.Id
Add-AzVMNetworkInterface -VM $vmConfig -Id $nic.Id
Set-AzVMOperatingSystem -VM $vmConfig -Windows -ComputerName $vmName -Credential $adminCreds 
Set-AzVMSourceImage -VM $vmConfig -PublisherName $publisherName -Offer $offerName -Skus $skuName -Version 'latest'
Set-AzVMOSDisk -VM $vmConfig -Name "$($vmName)_OsDisk_1_$(Get-Random)" -StorageAccountType $osDiskType -CreateOption fromImage
Set-AzVMBootDiagnostic -VM $vmConfig -Disable
Set-AzVMSecurityProfile -VM $vmConfig -SecurityType "Standard"
Register-AzProviderFeature -FeatureName UseStandardSecurityType -ProviderNamespace Microsoft.Compute
```

> **Note**: These commands set up the properties of the Azure VM configuration object that will be used to provision the new Azure VM, including the VM size, its availability set, network interface, computer name, local Administrator credentials, the source image, the operating system disk, and boot diagnostics settings.  

9. In the Cloud Shell pane, run the following command:

```powershell
New-AzVM -ResourceGroupName $resourceGroup.ResourceGroupName -Location $location -VM $vmConfig
```

> **Note**: This command initiates deployment of the new Azure VM  

> **Note**: Do not wait for the deployment to complete but instead proceed to the next task.  


#### Task 3: Deploy two Azure VMs running Linux into an availability set by using an Azure Resource Manager template

1. In the Azure portal, navigate to the **Create a resource** blade.

2. From the **Create a resource** blade, search Azure Marketplace for **Template deployment**, and select **Template deployment (deploy using custom templates)**.

3. Click **Create**.

4. On the **Custom deployment** blade, click the **Build your own template in the editor** link. If you do not see this link, click **Edit template** instead.

5. From the **Edit template** blade, load the template file **02-vms/files/azuredeploy.json**. 

> **Note**: Review the content of the template and note that it defines deployment of two Azure VMs hosting Linux Ubuntu into an availability set and into the existing virtual network **azscaleset-vnet0**. This virtual network does not exist in your deployment. You will be changing the virtual network name in the parameters below.  

6. Save the template and return to the **Custom deployment** blade. 

7. From the **Custom deployment** blade, navigate to the **Edit parameters** blade.

8. From the **Edit parameters** blade, load the parameters file **02-vms/files/azuredeploy.parameters.json**. 

9. Save the parameters and return to the **Custom deployment** blade. 

10. From the **Custom deployment** blade, initiate a template deployment with the following settings:

* Subscription: the name of the subscription you are using in this lab

- Resource group: the name of a new resource group **scaleset-RG**

- Location: the same Azure region you chose earlier in this exercise

- VM Name Prefix: **azlin-vm**

- Nic Name Prefix: **azscaleset-nic**

- Pip Name Prefix: **azscaleset-ip**

- Admin Username: **Student**

- Admin Password: **Pa55w.rd1234**

- Virtual Network Name: **azscaleset-RG-vnet** _(change this value from the template default)_

- Image Publisher: **Canonical**

- Image Offer: **UbuntuServer**

- Image SKU: **16.04.0-LTS**

- Vm Size: use **Standard_DS1_v2** 

> **Note**: Wait for the deployment to complete before you proceed to the next task. This should take about 5 minutes.  

> **Result**: After you completed this exercise, you have deployed an Azure VM running Windows Server 2022 Datacenter into an availability set by using the Azure portal, deployed another Azure VM running Windows Server 2022 Datacenter into the same availability set by using Azure PowerShell, and deployed two Azure VMs running Linux Ubuntu into an availability set by using an Azure Resource Manager template.  

> **Note**: You could certainly use a template to deploy two Azure VMs hosting Windows Server 2022 datacenter in a single task (just as this was done with two Azure VMs hosting Linux Ubuntu server). The reason for deploying these Azure VMs in two separate tasks was to give you the opportunity to become familiar with both the Azure portal and Azure PowerShell-based deployments.  


### Exercise 2: Configure networking settings of Azure VMs running Windows and Linux operating systems

The main tasks for this exercise are as follows:

1. Configure static private and public IP addresses of Azure VMs

2. Connect to an Azure VM running Windows Server 2022 Datacenter via a public IP address

3. Connect to an Azure VM running Linux Ubuntu Server via a private IP address


#### Task 1: Configure static private and public IP addresses of Azure VMs

1. In the Azure portal, search and navigate to the **azscaleset-vm0-ip** blade.

2. On the azscaleset-vm0-ip blade, click **Configuration** under **Settings**.

3. Confirm the public IP address is set to **Static**.

> **Note**: Take a note of the public IP address assigned to the network interface of **azscaleset-vm0**. You will need it later in this exercise.  

6. In the Azure portal, navigate to the **azlin-vm0** blade.

7. From the **azlin-vm0** blade, display the **Networking** blade and click **Network settings**.

8. On the **azlin-vm0 - Networking** blade, click the entry representing network interface.

9. From the blade displaying the properties of the network interface of **azlin-vm0**, navigate to **Settings** -> **IP configurations**.

10. On the **IP configurations** blade, click **ipconfig1** and configure it with a static private IP of  **10.103.0.100**, and then click **Save**.

11. Restart the VM to update the IP to the new static IP address.

> **Note**: It is possible to connect to Azure VMs via either statically or dynamically assigned public and private IP addresses. Choosing static IP assignment is commonly done in scenarios where these IP addresses are used in combination with IP filtering, routing, or if they are assigned to network interfaces of Azure VMs that function as DNS servers.  


#### Task 2: Connect to an Azure VM running Windows Server 2022 Datacenter via a public IP address

1. In the Azure portal, navigate to the **azscaleset-vm0** blade.

2. From the **azscaleset-vm0** blade, navigate to the **Networking** blade and select **Network settings**.

3. On the **azscaleset-vm0 - Networking** blade, review the inbound port rules of the network security group assigned to the network interface of **azscaleset-vm0**.

> **Note**: The default configuration consisting of built-in rules block inbound connections from the internet (including connections via the RDP port TCP 3389)  

4. Add an inbound security rule to the existing network security group with the following settings:

* Source: **Any**

* Source port ranges: **\***

* Destination: **Any**

* Destination port ranges: **3389**

* Protocol: **TCP**

* Action: **Allow**

* Priority: **100**

* Name: **AllowInternetRDPInbound**

Click **Add**

5. In the Azure portal, display the **Overview** pane of the **azscaleset-vm0** blade. 

6. From the **Overview** pane of the **azscaleset-vm0** blade, click **Connect** and download the RDP file and use it to connect to **azscaleset-vm0**.

7. When prompted, authenticate by specifying the following credentials:

* User name: **Student**

* Password: **Pa55w.rd1234**


#### Task 3: Connect to an Azure VM running Linux Ubuntu Server via a private IP address

1. Within the RDP session to **azscaleset-vm0**, start **Command Prompt**.

1. From the Command Prompt, run the following:

```
   nslookup azlin-vm0
```

1. Examine the output and note that the name resolves to the IP address you assigned in the first task of this exercise (**10.103.0.100**).

> **Note**: This is expected. Azure provides built-in DNS name resolution within a virtual network.   

1. In the command shell or PowerShell connect to **azlin-vm0** via the **SSH**.

   ```
   ssh Student@azlin-vm0
   ```

   

2. When prompted, authenticate with the password `Pa55w.rd1234`.


> **Note**: Both the username and password are case sensitive.  

5. Once you have successfully authenticated, terminate the RDP session to **azscaleset-vm0**.

6. Navigate to the **azlin-vm0** blade.

7. From the **azlin-vm0** blade, navigate to the **Networking** blade.

8. On the **azlin-vm0 - Networking** blade, review the inbound port rules of the network security group assigned to the network interface of **azscaleset-vm0** to determine why your SSH connection via the private IP address was successful.

> **Note**: The default configuration, consisting of built-in rules, allows inbound connections within the Azure virtual network environment (including connections via the SSH port).  

> **Result**: After you completed this exercise, you have configured static private and public IP addresses of Azure VMs, connected to an Azure VM running Windows Server 2022 Datacenter via a public IP address, and connected to an Azure VM running Linux Ubuntu Server via a private IP address  


### Exercise 3: Deploy and configure Azure VM scale sets

The main tasks for this exercise are as follows:

1. Identify an available DNS name for an Azure VM scale set deployment.

2. Deploy an Azure VM scale set.

3. Install IIS on a scale set VM by using DSC extensions.


#### Task 1: Identify an available DNS name for an Azure VM scale set deployment

1. From the Azure Portal, start a PowerShell session in the Cloud Shell pane. 

2. In the Cloud Shell pane, run the following command, substituting the placeholder &lt;custom-label&gt; with any string that is likely to be unique.

```powershell
$rg = Get-AzResourceGroup -Name azscaleset-RG 
$location = $rg.Location
Test-AzDnsAvailability -DomainNameLabel <custom-label> -Location $location
```

3. Verify that the command returned **True**. If not, rerun the same command with a different value of the &lt;custom-label&gt; until the command returns **True**. 

4. Note the value of the &lt;custom-label&gt; that resulted in the successful outcome. You will need it in the next task


#### Task 2: Deploy an Azure VM scale set

1. In the Azure portal, navigate to the **Create a resource** blade.

2. From the **Create a resource** blade, search Azure Marketplace for **Virtual machine scale set**.

3. Use the list of search results to navigate to the **Create virtual machine scale set** blade.

4. Use the **Create virtual machine scale set** blade to deploy a virtual machine scale set with the following settings:

- Subscription: the name of the subscription you are using in this lab
- Resource group: **scaleset-RG**
- Virtual machine scale set name: **azscalesetvmss0**
- Region: the same Azure region you chose in the previous exercises of this lab
- Availability zone: **None**
- Orchestration mode: **Flexible** (default)
- Security type: **Standard**
- Scaling mode: **Manually update the capacity**
- Instance count: **1**

* Image: **[smalldisk] Windows Server 2022 Datacenter**
* Username: **Student**
* Password: **Pa55w.rd1234**
* Instance size: **DS1 v2**
* Licensing: **Unchecked**

On the **Storage** page: 

* OS disk type: **Standard HDD**

On the **Networking** page:
* Virtual network: Edit the virtual network and configure it with the following settings:  
* Name: **azscaleset-vnet0**
* Address range: **10.203.0.0/16**
* Subnet name: **subnet0**
* Subnet starting address range: **10.203.0.0**
* Subnet size: **/24 (256 addresses)**
* Click **Save**
* Click **Save** again

Back on the **Networking** page:

Confirm the network interface has the following:

* NIC network security group: **Basic**
* Select inbound ports: **HTTP (80)**

Create a **Azure load balancer** with the following: 

* Load balancer name: **azscaleset-vnet0-lb**
* Type: **Public**
* Protocol: **TCP**
* Click **Create**
* Go to the **Management** tabe and Disable **Boot diagnostics**
* Click **Review + create**, then click **Create**

> **Note**: Wait for the deployment to complete before you proceed to the next task. This should take about 5 minutes.  


#### Task 3: Install IIS on a scale set VM by using DSC extensions

1. In the Azure portal, navigate to the **azscalesetvmss0** blade.

1. From the **azscalesetvmss0** blade, display its **Extensions + applications** blade under **Settings**.

1. From the **azscalesetvmss0 - Extension** blade, add the **PowerShell Desired State Configuration** extension with the following settings:

> **Note**: The DSC configuration module is available for upload from **02-vms/files/install_iis_vmss.zip**. The module contains the DSC configuration script that installs the Web Server (IIS) role. To upload the file, first create a storage account, then upload `install_iis_vmss.zip` to a public container.

- Configuration Modules or Script: **"install_iis_vmss.zip"** select the file from an Azure Blob Storage container 

- Module-qualified Name of Configuration: **install_iis_vmss.ps1\IISInstall**  

- Configuration Arguments: leave blank  

- Configuration Data PSD1 File: leave blank  

- WMF Version: **latest**  

- Data Collection: **Disable**  

- Version: **2.76**  

- Auto Upgrade Minor Version: **Yes**  
- Click **Create**

2. Navigate to the **azscalesetvmss0** **Overview** blade. 

3. Note the public IP address assigned to **azscalesetvmss0**.

4. In a browser, navigate to the public IP address you identified in the previous step.
   1. If you receive a secure connection error, continue to the site.

5. Verify that the browser displays the default IIS home page. 

> **Result**: After you completed this exercise, you have identified an available DNS name for an Azure VM scale set deployment, deployed an Azure VM scale set, and installed IIS on a scale set VM by using the DSC extension.  

## Exercise 4: Remove lab resources

#### Task 1: Open Cloud Shell

1. At the top of the portal, click the **Cloud Shell** icon to open the Cloud Shell pane.

2. At the Cloud Shell interface, select **Bash**.

3. At the **Cloud Shell** command prompt, type in the following command and press **Enter** to list all resource groups you created in this lab:

```sh
az group list --query "[?contains(name,'scale')].name" --output tsv
```

4. Verify that the output contains only the resource groups you created in this lab. These groups will be deleted in the next task.

#### Task 2: Delete resource groups

1. At the **Cloud Shell** command prompt, type in the following command and press **Enter** to delete the resource groups you created in this lab

```sh
az group list --query "[?contains(name,'scale')].name" --output tsv | xargs -L1 bash -c 'az group delete --name $0 --no-wait --yes'
```

2. Close the **Cloud Shell** prompt at the bottom of the portal.

> **Result**: In this exercise, you removed the resources used in this lab.  
