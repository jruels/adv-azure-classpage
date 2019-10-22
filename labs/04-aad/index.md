# Lab4: AAD-enterprise

**Contents** 

<!-- TOC -->

- [Enterprise-ready cloud hands-on lab step-by-step](#enterprise-ready-cloud-hands-on-lab-step-by-step)
	- [Abstract and learning objectives](#abstract-and-learning-objectives)
	- [Overview](#overview)
	- [Requirements](#requirements)
	- [Solution architecture](#solution-architecture)
	- [Exercise 1: Create the policy for Enterprise IT](#exercise-1-create-the-policy-for-enterprise-it)
		- [Help references](#help-references)
		- [Task 1: Create a Management Group](#task-1-create-a-management-group)
		- [Task 2: Apply the service catalog policy](#task-2-apply-the-service-catalog-policy)
		- [Task 3: Restrict the creation of ExpressRoute circuits](#task-3-restrict-the-creation-of-expressroute-circuits)
		- [Task 4: Restrict the creation of resources in regions](#task-4-restrict-the-creation-of-resources-in-regions)
		- [Task 5: Create and apply a naming convention](#task-5-create-and-apply-a-naming-convention)
		- [Task 6: Test the policies](#task-6-test-the-policies)
	- [Exercise 2: Configure delegated permissions](#exercise-2-configure-delegated-permissions)
		- [Help references](#help-references-1)
		- [Task 1: Create groups in Azure AD for delegation](#task-1-create-groups-in-azure-ad-for-delegation)
		- [Task 2: Create user accounts in Azure AD for delegation](#task-2-create-user-accounts-in-azure-ad-for-delegation)
		- [Task 3: Enable a business unit administrator for the subscription](#task-3-enable-a-business-unit-administrator-for-the-subscription)
		- [Task 4: Enable project-based delegation and chargeback with tags](#task-4-enable-project-based-delegation-and-chargeback-with-tags)
	- [Exercise 3: Use Azure Blueprints to govern your Azure environment](#exercise-3-use-azure-blueprints-to-govern-your-azure-environment)
		- [Help references](#help-references-2)
		- [Task 1: Create a new Azure Blueprint](#task-1-create-a-new-azure-blueprint)
		- [Task 2: Publish a draft blueprint and assign it](#task-2-publish-a-draft-blueprint-and-assign-it)
		- [Task 3: Update the Service catalog policy to allow blueprint assignments](#task-3-update-the-service-catalog-policy-to-allow-blueprint-assignments)
		- [Task 4: Assign a blueprint](#task-4-assign-a-blueprint)
		- [Task 5: Verify blueprint assignment and resource creation](#task-5-verify-blueprint-assignment-and-resource-creation)
		- [Task 6: Editing blueprints](#task-6-editing-blueprints)
		- [Task 7: Verify compliance with Azure Policy](#task-7-verify-compliance-with-azure-policy)
	- [After the hands-on lab](#after-the-hands-on-lab)
		- [Task 1: Remove resources and configuration created during this lab](#task-1-remove-resources-and-configuration-created-during-this-lab)

<!-- /TOC -->

# Enterprise-ready cloud hands-on lab step-by-step

## Abstract and learning objectives

In this hands-on lab, you are working with Trey Research to setup some best practices regarding policies, permissions, and managing their Azure subscriptions using advanced tooling such as Azure Blueprints. Tasks include creating scripts that Enterprise IT will use to automatically set policy and delegate permissions when a new subscription is created. You will also learn how to manage these policies and permissions for multiple subscriptions using Azure Management Groups and Azure Blueprints.

At the end of this hands-on lab, you will know how to provide cost tracking by business unit, environment and project, provide for a distributed administration model, put a service catalog in place to prevent deployment of unsupported Azure services, and put controls in place to allow deployment of services only in specific regions.

## Overview

Trey Research is a manufacturing company that builds consumer products with 29.6 billion USD in annual revenue. Trey's headquarters are in New Jersey, but they have data centers and branch offices scattered across the United States; with several major offices in the United Kingdom, France, and Japan.

Even as large as it is, Trey seeks to maximize the cost-effectiveness and flexibility of its IT, especially in new projects and business units. With a dizzying number of existing business units; each with their own unique requirements from IT and ballooning costs from internal hardware and data center investment, Trey is looking to the cloud.

Trey is interested in a large-scale solution that will help mitigate creeping costs and start the transition to a modern cloud-based enterprise architecture using a solid set of controls for governance.

## Requirements

1. Full global admin access to the Azure AD tenant associated with your Azure subscription.

## Solution architecture
![](index/image2.png)

* Exercise 1: Create the policy for Enterprise IT

Duration: 60 minutes

In this exercise, you will first create a Management Group for your Azure subscription(s). You will apply several of the built-in Azure Policy definitions to that Management Group to ensure that users stay within the scope of supported services for Enterprise IT. Finally, you will create a new policy initiative defining a multi-resource naming convention and apply that initiative to the Management Group.

### Help references

|    |            |
|----------|:-------------:|
| Governance in the Microsoft CAF for Azure | https://docs.microsoft.com/azure/architecture/cloud-adoption/governance/overview |
| The Five Disciplines of Cloud Governance | https://docs.microsoft.com/azure/architecture/cloud-adoption/governance/governance-disciplines |
| Azure Policy | <https://docs.microsoft.com/azure/azure-policy/azure-policy-introduction> |
| Azure Management Groups | <https://docs.microsoft.com/azure/azure-resource-manager/management-groups-overview> |

### Task 1: Create a Management Group

In this task, you will create a new Management Group and move a subscription into this Management Group. We'll later assign Azure Policy using the Management Group scope, so that it applies automatically to all subscriptions under that scope.

>**Note**: We'll use our own Management Group, if you have permissions you could also use the Tenant Root Management Group.

1. Launch the Azure Management Portal, and navigate to **Management Groups** under **All services**:

    ![Portal screenshot showing All Service \> Management Groups Select sequence](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image4.png "Create Management Group Select path")

2. Select **Start using management groups** to launch the **Add management group** blade.

    ![Azure portal screenshot, showing the Start using management groups button that is used to launch the Add management group blade.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image89.png "Start using management groups button")

    If you already have management groups in place, you can use the **Add management group** button to launch the **Add management group** blade.

    ![Azure portal screenshot, showing the Add management group button that is used to launch the Add management group blade.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image91.png "Add management group button")

3. In the **Add management group** blade fill in the management group ID and display name (we'll use 'ERC' as the management group ID and 'Enterprise Ready Cloud' as the display name). If you have existing management groups, create this as a child of Root and select **Save**.

    ![Azure portal screenshot, showing New Management Group, then the group ID and name being filled in.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image5.png "Create Management Group blade")

>**Note**: If this is the first management group being created, note that it may take up to 15 minutes for it to complete.

   ![Azure portal screenshot showing the toast notification that notifies the user it may take up to 15 minutes to create the management group.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image90.png "Create management group toast notification")

4. Select the newly-created management group, then select **details**.

    ![Azure portal screenshot showing the details link for the newly created management group.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image92.png "Details link")

    Select **Add Subscription** and for the subscription, choose your subscription from the drop-down list, then select **Save**.

    ![Azure portal screenshot, showing adding an existing subscription to a management group](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image6.png "Add subscription to management group screenshot")

### Task 2: Apply the service catalog policy

In this exercise, you will apply one of the built-in Azure Policies to restrict services to the supported list provided by Trey Research.

1. First, we need to build a list of resource types, which will be permitted, and their corresponding resource providers. One way to do this is to use PowerShell. Launch the Azure Cloud Shell and select PowerShell. If prompted to create storage, select the **Create storage** button. Accept the prompt for storage.

    ![Azure portal screenshot showing the button to launch the Azure Cloud Shell.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image93.png "Azure Cloud Shell launch button")

    ![Azure portal screenshot showing the Azure Cloud Shell first launch experience.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image94.png "Azure Cloud Shell PowerShell")

2. Enter the following script into the window and run the script:

    ```powershell
    $FormatEnumerationLimit = -1
    Get-AzResourceProvider `
        | Select-Object ProviderNamespace, ResourceTypes `
        | Format-List
    ```

3. Review the list, and identify the resource providers and resource types for each of the following:

    ```s
    Resource Name
    --------------------------
		- Resource Group
		- Virtual Machines
		- Disk
		- Network Interface
		- Public IP Address
		- Network Security Group
		- Virtual Networks
		- Virtual Network Gateways
		- ExpressRoute Circuits
		- VPN Gateways
		- Storage Accounts
		- Backup Vault
		- Site Recovery Vault
		- DevTest Labs
		- Key Vault
		- Web Apps
		- SQL Database
    ```

    For example, to find all of the resource providers with resource groups as a resource type, a query like the following could be used:

    ```powershell
    Get-AzResourceProvider `
        | Select-Object ProviderNamespace, ResourceTypes `
        | Where-Object { $_.ResourceTypes.ResourceTypeName -like "*resource*groups*" } `
        | Format-List
    ```

    This query shows that the `resourceGroups` resource type is a member of the resource provider `Microsoft.Resources`.

    By altering the `-like` clause, you can filter to easily find the resource providers for the remaining resource types.

    >**Note**: If you do not see the Microsoft.Compute resource provider it is because you have not yet created any compute resources. You can manually register the provider with the following command:

    ```powershell
    Register-AzureRmResourceProvider -ProviderNamespace Microsoft.Compute
    ```

4. Launch the Azure Management portal, and navigate to **Policy** under **All services**:

    ![Azure portal screenshot, showing Select sequence All Services, then Policy.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image7.png "Azure Policy Select path screenshot")

    > **Hint**: Select the star next to the Policy service to pin it to your Portal navigation. You will visit the Policy service throughout the lab.

5. Select **Definitions**, then **+ Policy definition**. 

    ![Azure portal screenshot, showing Select sequence Definitions, then add Policy definition.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image101.png "Add Policy definition") 

6. In the Policy definition blade, use the following configurations:

		- Definition location: **Enterprise Ready Cloud** (ERC) management group, as created in Task 1.
		- Name: **Service catalog**
		- Description: **Restrict resource types to those permitted by Enterprise IT**.
		- Category: **Create new** > **Service catalog**
		- Policy rule: ***Replace the default JSON with the following code:***

    ```json
    {
        "policyRule": {
            "if": {
                "not": {
                    "anyOf": [
                        {
                        "source": "action",
                        "like": "Microsoft.Resources/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/extensions/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/locations/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/disks/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/disks/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/diagnosticSettings/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/metricDefinitions/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/virtualMachines/images/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Compute/availabilitySets/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/loadBalancers/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/virtualNetworks/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/networkSecurityGroups/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/publicIPAddresses/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/networkInterfaces/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/operations/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/locations/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/expressRouteCircuits/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/virtualNetworkGateways/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/vpnGateways/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Network/p2sVpnGateways/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Storage/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.RecoveryServices/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.DevTestLab/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.KeyVault/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Web/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.SQL/*"
                        },        
                        {
                        "source": "action",
                        "like": "Microsoft.Authorization/*"
                        },
                        {
                        "source": "action",
                        "like": "Microsoft.Insights/*"
                        }
                    ]
                }
            },
            "then" : {
                "effect" : "deny"
            }
        }
    }
    ```

7. Select **Save**.

8. On the ***Policy \- Definitions*** blade, select the **Service catalog** policy definition you just created and then select **Assign** on the *Service catalog* blade.

    ![Azure portal screenshot showing the service catalog policy definition.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image102.png "Service catalog policy definition")
    
    >**Note**: If you do not see the policy, make sure "Enterprise Ready Cloud" is the selected scope, and not another Management group or an individual subscription.

9. On the ***Service catalog \- Assign policy blade***, specify the following configurations and then Select **Assign** to assign your policy definition to your Enterprise Ready Cloud management group:

		- Scope: **Enterprise Ready Cloud**
		- Exclusions: **None**
		- Policy definition: **Service catalog**
		- Assignment name: **Service catalog policy**
		- Description: **Restrict resource types to those permitted by Enterprise IT**.
		- Assigned by: **Enterprise IT**

    The assignment form should look like this:

    ![Azure portal screenshot, showing the Assign Policy blade. The Allowed resource types policy has been chosen, and 12 resource types selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image103.png "Assign Policy blade")

    Select **Assign**.

### Task 3: Restrict the creation of ExpressRoute circuits

In this exercise, you will apply another built-in Azure policy to restrict the creation of ExpressRoute circuits. For this policy, we'll use an exclusion scope for the resource group in which Enterprise IT will create the permitted ExpressRoute circuits.

1. First, we'll create the resource group for the exclusion scope. Select **Resource groups**, then **Add**, and then fill in the resource group name **ExpressRouteRG**, select your subscription, and choose a resource group location:

    ![Azure portal screenshot, showing adding a resource group called \'ExpressRoute-group\'](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image104.png "Create resource group Select path")

2. Once complete, select **Review + Create** and then **Create**.

3. Return to the **Policy** blade in the Azure portal. Select **Assignments**, then **Assign Policy**. Complete the form as follows:

		- Scope: **Enterprise Ready Cloud** (The management group created earlier.)
		- Exclusions: **The resource group created in Step 1 above. Select the management group, subscription, and resource group**.    
		- Policy definition: **Not allowed resource types**
		- Assignment name: **Block ExpressRoute circuits**
		- Description: **Block creating of ExpressRoute circuits, except in the Enterprise IT dedicated ExpressRoute resource group**
		- Assigned by: **Enterprise IT**
		- Parameters \| Not allowed resource types: **Microsoft.Network/expressRouteCircuits**

    The assignment form should look like this:

    ![Azure portal screenshot, showing the Assign Policy blade. The policy is \'Not allowed resource types\' and the ExpressRouteCircuits resource type has been selected. The policy is assigned at the Management group scope, with the ExpressRouteGroup resource group as an exclusion path.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image105.png "Assign Policy blade")

4. When complete, select **Assign** to create the policy assignment.

### Task 4: Restrict the creation of resources in regions

In this exercise, you will create a new Azure Policy assignment that restricts the regions in which resources can be created in.

1. In the Azure portal, navigate to **Policy**, then select **Assignments**, then **Assign Policy**. Complete the form as follows:

		- Scope: **Enterprise Ready Cloud**
		- Exclusions: **None**
		- Policy definition: **Allowed locations**
		- Assignment name: **Restrict Azure locations**
		- Description: **Restrict Azure resources to the list of Azure regions permitted by Enterprise IT**.
		- Assigned by: **Enterprise IT**
		- Parameters \| Allowed locations: **East US, West US, North Europe, West Europe, Japan East, Japan West**

    The assignment form should look like this:

    ![Azure portal screenshot, showing the Assign Policy blade. The \'Allowed locations\' policy has been selected, with 6 locations selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image107.png "Assign Policy blade")

2. When complete, select **Assign** to create the policy assignment.

### Task 5: Create and apply a naming convention

In this task, we will define a simple naming convention for Azure resources. We shall simply require that virtual machine names end with ***-vm*** and virtual networks end with ***-vnet***. We will implement this naming convention using a custom policy definition and a policy initiative, assigned at the management group scope.

First, we will create a generic policy definition that restricts resources of a given type to have a given name suffix. The resource type and name suffix will be specified using parameters.

1. In the Azure portal, open the **Policy** blade, then select **Definitions** and then **+ Policy definition**.

    ![Azure portal screenshot, showing the Select sequence Policy then Definitions then Add Policy Definition.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image106.png "Add policy definition Select path")

2. Complete the Policy definition form as follows:

		- Definition location: **Enterprise Ready Cloud** (The Management Group created earlier.)
		- Name: **Restrict Resource Name Suffix**
		- Description: **Restrict resources of a given type to have a name ending with a given suffix. The resource type and suffix are parameterized.**
		- Category:  **Create new** > **Naming**
		- Policy rule and parameters: **As shown below:**

    ```json
    {
        "properties": {
            "mode": "all",
            "parameters": {
                "resourceType": {
                    "type": "string",
                    "metadata": {
                        "displayName": "Resource Type",
                        "description": "The resource type for this policy",
                        "strongType": "resourceTypes"
                    }
                },
                "nameSuffix": {
                    "type": "string",
                    "metadata": {
                        "displayName": "Resource Name Suffix",
                        "description": "The suffix that must be appended"
                    }
                }
            },
            "policyRule": {
                "if": {
                    "allof": [
                    {
                        "field": "type",
                        "equals": "[parameters('resourceType')]"
                    },
                    {
                        "not": {
                        "field": "name",
                        "like": "[concat('*-', parameters('nameSuffix'))]"
                        }
                    }
                    ]
                },
                "then": {
                    "effect": "deny"
                }
            }
        }
    }
    ```

3. Once the policy definition is complete, select **Save**.

4. Next, we shall create a policy initiative comprising multiple instances of our policy definition (one per resource type).

    From the **Policy** blade, on the **Definitions** panel, select **+ Initiative Definition**.

5. Fill in the **Initiative definition** blade as follows (but **do not** select **Save** yet).

		- Definition location: **Enterprise Ready Cloud** (the Management Group created earlier)
		- Name: **Naming Convention**
		- Description: **Trey Research resource naming convention**
		- Category: **Use Existing** > **Naming**

    ![Azure portal screenshot showing the \'Basics\' section of the New Policy Initiative Definition blade. The Name has been filled in as \'Naming Convention\'.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image13.png "New Policy Definition - Basics")

6. Under ***Available Definitions***, find the *Restrict Resource Name Suffix* policy definition created in Step 2.

    ![Azure portal screenshot showing the \'Available Definitions\' section of the New Policy Initiative Definition blade. The filter has been filled in as \'restrict\' and the results show the \'Restrict Resource Name Suffix\' policy definition](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image14.png "Available Definitions screenshot")

7. Select the policy definition, then select **+Add** to add the Policy Definition to the Policy Initiative.

    ![Azure portal screenshot, showing adding the \'restrict resource name suffix\' custom policy definition to a policy initiative](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image15.png "Adding Policy Definition to Policy Initiative")

8. Select the resource type and name suffix. In this case, we'll choose **Microsoft.Compute/virtualMachines** as the resource type and **vm** as the name suffix. **Do not Select Save**.

    ![Azure portal screenshot, showing filling in the parameters for the \'Restrict Resource Name Suffix\' policy definition, as part of the policy initiative definition](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image16.png "Policies and Parameters screenshot")

9. Repeat steps 5, 6, and 7 above for each of the following resource types:

		- Virtual Networks
				- Resource Type: **Microsoft.Network/virtualNetworks**
				- Resource Name Suffix: **vnet**

10. Once you've added each resource type, select **Save**.

11. Finally, we will apply the policy initiative across all subscriptions in the Management Group by creating an assignment at the Management group scope.

    On the **Policy** blade, select **Assignments** and then **Assign Initiative**.

    ![Azure portal screenshot, showing the Select sequence policy then Assignments then Assign Initiative.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image108.png "Assign Initiative Select path")

12. Complete the Assign Initiative form as follows:

		- Scope: **Enterprise Ready Cloud** (the Management Group created earlier)
		- Exclusions: **None**
		- Initiative definition: **Naming Convention** (the initiative definition we just created).
		- Assignment name: **Resource Naming Convention**
		- Description: **Enforces company-wide resource naming convention**
		- Assigned by: **Enterprise IT**

    The assignment form should look like this:

    ![Azure portal screenshot, showing the Assign Initiative blade. The Naming Convention policy initiative has been selected, and the assignment is at management group scope.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image109.png "Assign Initiative Azure portal blade")

13. When complete, select **Assign** to create the policy initiative assignment.

### Task 6: Test the policies

In this task, you will use the Azure management portal to validate each of the policies created so far, and understand how to identify policy events.

#### Subtask 1: Test the service catalog policy <!-- omit in toc -->

1. Select **Create a Resource \> Internet of Things \> IoT Hub**.

    ![Azure portal screenshot, showing Select sequence to create an IoT Hub resource](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image19.png "Create IoT hub Azure portal Select path")

2. Specify a unique name for the IoT Hub, and choose an existing resource group. Choose a permitted location (we are only testing the Service Catalog policy at this time).

    Once all the settings have been filled in, select **Review + create** followed by **Create**.

    ![Azure portal screenshot showing the review and create experience for an IoT Hub.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image95.png "Azure IoT Hub Create")

3. The IoT Hub creation blade should show an error:

    ![Azure portal screenshot, showing error message \"There were policy errors. Select here to view details\"](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image21.png "Policy Error screenshot")

#### Subtask 2: Test the ExpressRoute circuit policy <!-- omit in toc -->

1. Select **Create a resource** **\>** **Networking** **\>** **ExpressRoute**.

    ![Azure portal screenshot, showing Select sequence to create an ExpressRoute circuit](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image23.png "Create ExpressRoute Select path")

2. Specify the following configuration for the circuit and select **Create**.

		- Create new or import from classic: **Create new**
		- Circuit name: **TestCircuit**
		- Provider: **AT&T**
		- Peering location: **Silicon Valley**
		- Bandwidth: **50Mbps**
		- SKU: **Standard**
		- Billing model: **Unlimited**
		- Subscription: **Select your Azure subscription**
		- Resource group: **Any resource group *except* ExpressRouteRG OR Create new**.
		- Location: **Any available location in the allowed locations policy**.

    ![The Circuit configuration fields are set to the following settings: Circuit name, TestCircuit; Provider, AT&T; Peering location, Silicon Valley; Bandwidth, 50Mbps; SKU, Standard; Billing model, Unlimited; Subscription, Microsoft Azure; Resource Group, PolicyTestRG, Location, West US.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image24.png "Circuit configuration fields") 

3. As with the Service Catalog policy, you should see an error in the Create ExpressRoute Circuit blade, which when Selected shows the error details:

    ![Azure portal screenshot, showing error message \"There were policy errors. Select here to view details\".](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image96.png "Validation Error screenshot")

    ![Azure portal screenshot, showing Errors blade. The error message states the template deployment failed due to a policy violation.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image97.png "Policy Violation error message")

    >**Note**: If you created a new resource group in the previous step, you will see that the resource group has been created even though the deployment of the resource failed. This is because the policy that was created to restrict the creation of ExpressRoute circuits specifically targets that Azure resource type and a resource group is another distinct resource type.

#### Subtask 3: Test the resource location policy <!-- omit in toc -->

1. Testing the resource location policy follows a similar pattern. Attempt to create a permitted resource, with a permitted name, but in a not-permitted region. For example, attempt to create a virtual network named 'erc-vnet' in South Central US. This should be rejected by the 'Restrict Azure locations' policy.

    ![Azure portal screenshot, showing Errors blade. The error message states the template deployment failed due to a policy violation.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image110.png "Policy Violation error message")

2. To test further, change to a permitted location (e.g. East US) and try again. This time, the virtual network should be created without issue.

    >**Note**: Recall that an initiative assignment was made earlier to deny the creation of resources that do not meet the organizational naming conventions. If you had attempted to create a virtual networking without `-vnet` in its name, the creation of the resource would have been denied by the initiative assignment and its associated configuration.

#### Subtask 4: Test the naming convention policy <!-- omit in toc -->

1. Attempt to create a permitted resource, in a permitted location, with a not-permitted name. For example, create a virtual network named 'erc-network' in East US. This should be rejected by the 'Resource Naming Convention' policy.

2. To test further, change to a permitted name (e.g. 'erc-network-vnet') and try again---this time, the virtual network should be created without issue.

## Exercise 2: Configure delegated permissions

Duration: 60 minutes

In this exercise, you will configure delegated permissions for users in the Trey Research business unit. You will use the Azure AD Graph commands in the Azure CLI to work with users and groups and you will extend a PowerShell script to automatically provision a limited access user with the configuration of the subscription.

### Help references

|    |            |
|----------|:-------------:|
| Add new users to Active Directory | <https://docs.microsoft.com/azure/active-directory/add-users-azure-active-directory> |
| How Subscriptions are associated with Azure AD | <https://docs.microsoft.com/azure/active-directory/active-directory-how-subscriptions-associated-directory> |
| Managing Azure AD Security Groups | <https://docs.microsoft.com/azure/active-directory/active-directory-groups-create-azure-portal> |
| Role Based Access Control  | <https://docs.microsoft.com/azure/active-directory/role-based-access-control-configure> |
| Manage RBAC with PowerShell | <https://docs.microsoft.com/azure/active-directory/role-based-access-control-manage-access-powershell> |
| Manage Azure Active Directory Graph entities needed for RBAC | <https://docs.microsoft.com/cli/azure/ad?view=azure-cli-latest> |

### Task 1: Create groups in Azure AD for delegation

In this task, you will create two groups in Azure AD that you will use for testing delegated access control. In the next task, users will be created that will be added to these new security groups.

1. Launch the Azure Cloud Shell and select PowerShell. If prompted to create storage, Select the **Create storage** button.

    ![Azure portal screenshot showing the button to launch the Azure Cloud Shell.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image93.png "Azure Cloud Shell launch button")

    ![Azure portal screenshot showing the Azure Cloud Shell first launch experience.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image94.png "Azure Cloud Shell PowerShell")

    >**Note**: In the following commands, we will use the Azure CLI to provision users and groups in Azure AD. The PowerShell Cloud Shell gives us access to *both* the Azure PowerShell module (Az) and the Azure CLI.

2. In the shell, execute the following script to create two new security groups:

    ```powershell
    az ad group create --display-name "BU-Electronics-Admins" --mail-nickname "BU-Electronics-Admins"
    az ad group create --display-name "BU-Electronics-Users" --mail-nickname "BU-Electronics-Users"
    ```

### Task 2: Create user accounts in Azure AD for delegation

In this task, you will create two user accounts in Azure AD that you will use for testing delegated access control.

1. Execute the following script to find out the name of your Azure AD tenant (this will be needed in the next step) and store it in a variable.

    ```powershell
    $aadDomain = (az ad signed-in-user show --query userPrincipalName -o tsv).Split("@")[1]
    echo $aadDomain
    ```

1. Create the first user, **Electronics Admin** and add the user to the **BU-Electronics-Admins** security group.

    ```powershell
    az ad user create --display-name "Electronics Admin" --password "demo@pass123" --user-principal-name "ElectronicsAdmin@$aadDomain"
    $memberId = (az ad user show --upn-or-object-id "ElectronicsAdmin@$aadDomain" --query objectId -o tsv)
    az ad group member add --group "BU-Electronics-Admins" --member-id $memberId
    ```

1. Next, create the user **Electronics User** and add the user to the **BU-Electronics-Users** security group.

    ```powershell
    az ad user create --display-name "Electronics User" --password "demo@pass123" --user-principal-name "ElectronicsUser@$aadDomain"
    $memberId = (az ad user show --upn-or-object-id "ElectronicsUser@$aadDomain" --query objectId -o tsv)
    az ad group member add --group "BU-Electronics-Users" --member-id $memberId
    ```

### Task 3: Enable a business unit administrator for the subscription

In this task, you will update a script to automatically add a user to the contributor role of the subscription.

1. Launch the Azure Cloud Shell and select PowerShell. If prompted to create storage, Select the **Create storage** button.

    ![Azure portal screenshot showing the button to launch the Azure Cloud Shell.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image93.png "Azure Cloud Shell launch button")

    ![Azure portal screenshot showing the Azure Cloud Shell first launch experience.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image94.png "Azure Cloud Shell PowerShell")

2. Create a new script the Cloud Shell using **code** by typing the following:

    ```s
    code
    ```

3. Add the following code to script, and save the file. This code will retrieve the object ID for the Active Directory group passed in and assign the group to the Contributor role on the subscription.

    ```powershell
    param([string]$SubscriptionId, [string]$AdGroupName) 

    Select-AzSubscription -SubscriptionId $SubscriptionId

    $scope = "/subscriptions/$SubscriptionId"

    $groupObjectId = (Get-AzADGroup -SearchString $AdGroupName).Id

    Write-Output "Adding group to contributor role"

    New-AzRoleAssignment -Scope $scope `
                            -RoleDefinitionName "Contributor" `
                            -ObjectId $groupObjectId 
    ```

    This code will add an Azure AD security group to the contributor role at the subscription scope.

4. Save the file as **ConfigureSubscription.ps1** by Selecting **Save** in the menu behind the ellipsis (...).

    ![Azure portal screenshot showing the Azure Cloud Shell and the Save function in code.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image111.png "Azure Cloud Shell code Save file command")

5. Close **code** using the **Close Editor** command by Selecting **Close Editor** in the menu behind the ellipsis (...).

6. Create a local variable in the **Console** containing your Subscription ID (you can copy your subscription ID from the Azure portal, or obtain it using `Get-AzSubscription`). In this example, we will obtain is using the referenced cmdlet.

    ```powershell
    $SubscriptionId = (Get-AzSubscription).SubscriptionId
    ```

    >**Note**: If your account has access to multiple Azure subscriptions you may need to alter the command to target the proper subscription using the `-SubscriptionId` or `-SubscriptionName` parameter with the `Get-AzSubscription` cmdlet.

7. Execute the script passing in the `-SubscriptionID` and `-AdGroupName` parameters:

    ```powershell
    . $HOME\ConfigureSubscription.ps1 -SubscriptionId $SubscriptionId -AdGroupName "BU-Electronics-Admins"
    ```

8. In a different type of browser, or in an In-Private or Incognito mode window in your current browser navigate to the Azure management portal in a browser <http://portal.azure.com>, and sign in using the **ElectronicsAdmin** credentials created earlier.

    >**Note**: You may be prompted to configure a method of resetting your account. If you are, you can choose either a phone call or email.

9. Select **All services**, search for **Subscriptions**, and then select **Subscriptions**.

    ![Azure portal screenshot, showing subscriptions button.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image112.png "Subscriptions button")

10. Select the name of the subscription you have been working on.

11. Select the **Access control (IAM)** tile and Select the **Role assignments** tab:

    ![Azure portal screenshot, showing \'Access Control (IAM)\' button.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image34.png "Access Control button")

12. You should see the **BU-Electronics-Admins** group assigned to the contributor role.

    ![Under User, the BU-Electronics-Admin group is circled. It has the Role of Contributor, and Access as Assigned.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image113.png "BU-Electronics-Admin group")

    >**Note**: Users in the Contributor role scoped at the subscription have full access to all the resources within the subscription, but cannot grant access to others or change policies on the subscription.

### Task 4: Enable project-based delegation and chargeback with tags

In this task, you will create a script that will create a new resource group, assign 'Owner' rights over the resource group to a given AD group, and then apply a policy to enforce an 'IOCode' and 'CostCenter' tag with a given value.

1. Login to the Azure portal at <https://portal.azure.com> using your normal credentials (not the ElectronicsAdmin account).

2. Launch the Azure Cloud Shell and select PowerShell. If prompted to create storage, Select the **Create storage** button.

    ![Azure portal screenshot showing the button to launch the Azure Cloud Shell.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image93.png "Azure Cloud Shell launch button")

    ![Azure portal screenshot showing the Azure Cloud Shell first launch experience.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image94.png "Azure Cloud Shell PowerShell")

3. Create a new script called **CreateProjectResourceGroup.ps1** and open in the Cloud Shell using **code** by typing the following:

    ```s
    touch CreateProjectResourceGroup.ps1; code CreateProjectResourceGroup.ps1
    ```

4. Add the following code to the script, and **Save** the file:

    ```powershell
    param(
        [string]$SubscriptionId,
        [string]$ResourceGroupName,
        [String]$Location,
        [String]$IOCode,
        [String]$CostCenter,
        [string]$AdGroupName
    )

    Select-AzSubscription -SubscriptionId $SubscriptionId

    # Create resource group
    New-AzResourceGroup -Name $ResourceGroupName -Location $Location 

    $scope = "/subscriptions/$subscriptionId/resourceGroups/$resourceGroupName"

    # Assign Owner role to given group
    $groupObjectId = (Get-AzADGroup -SearchString $AdGroupName).Id

    New-AzRoleAssignment -Scope $scope `
                            -RoleDefinitionName "Owner" `
                            -ObjectId $groupObjectId

    # Assign policy to apply IOCode tag
    $definition = Get-AzPolicyDefinition | where {$_.Properties.displayName -eq "Append tag and its default value"}

    $parameters = @{
        tagName = 'IOCode'
        tagValue = $IOCode
        }

    New-AzPolicyAssignment -Name "AppendIOCode" `
                                -Scope $scope `
                                -DisplayName "Append IO Code" `
                                -PolicyDefinition $definition `
                                -PolicyParameterObject $parameters

    # Assign policy to apply CostCenter tag
    $definition = Get-AzPolicyDefinition | where {$_.Properties.displayName -eq "Append tag and its default value"}

    $parameters = @{
        tagName = 'CostCenter'
        tagValue = $CostCenter
        }

    New-AzPolicyAssignment -Name "AppendCostCenter" `
                                -Scope $scope `
                                -DisplayName "Append Cost Center" `
                                -PolicyDefinition $definition `
                                -PolicyParameterObject $parameters
    ```

    This code creates a new resource group in the specified region. It then assigns the group to the owner role definition just for the resource group. It will allow users in the group to have full ownership of resources within the resource group only. This code applies a built-in policy to append a tag with name 'IOCode' and another tag for 'CostCenter' and then applies the given tag value to any resource created in the resource group.

    >**Note**: The 'Apply tag and its default value' policy applies tags to the resources included in the assignment scope, but it does not apply any tags to the parent resource group for those resources. It is important to understand that in Azure, tags are not automatically inherited from a parent object without additional configuration.

5. Close **code** using the **Close Editor** command by Selecting **Close Editor** in the menu behind the ellipsis (...).

6. In the **Console** pane, create a new variable called **\$location**, and specify a region name to deploy to the resource group to. This location must be one of the supported regions in your previously created policy.

    ```powershell
    $location = "East US"
    ```

7. In the **Console** pane, create a new variable called **\$resourceGroupName**, and specify the value as **DelegatedProjectDemRG**. Also, make sure you create a **\$SubscriptionId** variable as you did earlier.

    ```powershell
    $resourceGroupName = "DelegatedProjectDemoRG"
    $SubscriptionId = (Get-AzSubscription).SubscriptionId
    ```

    >**Note**: If your account has access to multiple Azure subscriptions you may need to alter the command to target the proper subscription using the `-SubscriptionId` or `-SubscriptionName` parameter with the `Get-AzSubscription` cmdlet.

    >**Note**: If you receive an error similar to the following `Get-AzSubscription : The access token expiry UTC time '4/24/2019 3:31:22 PM' is earlier than current UTC time '4/24/2019 3:44:34 PM'.` you can re-authenticate to your Azure account using the `Connect-AzAccount` cmdlet.

8. In the **Console** pane, execute the following command to create a new resource group with delegated permissions and IO Code and Cost Center policies scoped to the resource group.

    ```powershell
    . $HOME\CreateProjectResourceGroup.ps1 -SubscriptionId $SubscriptionId -ResourceGroupName $resourceGroupName -Location $location -IOCode "1000150" -CostCenter "Marketing" -AdGroupName "BU-Electronics-Admins"
    ```

9. Create a new storage account in the resource group (choose a unique name) to validate the ioCode tag was applied (replace *uniquestorageaccount* with a unique value).

    ```powershell
    New-AzStorageAccount -ResourceGroupName $resourceGroupName `
        -Name "uniquestorageaccount" `
        -SkuName Standard_LRS `
        -Location $location
    ```

10. You can now search for resources with the applied tags to verify the policy has been applied. Execute the following PowerShell to validate that the storage account has been tagged.

    ```powershell
    Get-AzResource -TagName IOCode
    Get-AzResource -TagName CostCenter
    ```

    In the output, you should see your storage account returned for each tag.

    ![A screen of the output of the command Get-AzureRmResource -TagName CostCenter.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image98.png "PowerShell output")

    >**Note**: It can take several minutes for the policies assignments that were made in the previous step to take effect. If you find that the tags were not automatically applied, delete the storage account and recreate it. After recreating it, you should see the tags applied with the `Get-AzResource` cmdlet.

11. Switch back to the Azure Management portal using the ElectronicsAdmin credentials.

12. Select **Resource Groups**.

13. Select the **DelegatedProjectDemoRG** resource group.

    ![Screenshot of the DelegatedProjectDemo resource group.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image114.png "DelegatedProjectDemo resource group")

14. Select the **Access control (IAM)** icon, then select the **Role assignments** tab. Note that the BU-Electronics-Admins security group is set as an Owner of the resource group.

    ![Under User, the BU-Electronics-Admin group now has the Role of Owner, Contributor, which is circled.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image115.png "Owner, Contributor permissions")

15. Select **+ Add** followed by **Add role assignment**.

    ![Screenshot of the Add role assignments button.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image116.png "Add role assignments button")

16. Select **Owner** for the Role.

    ![In the Select a role blade, Owner is circled.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image41.png "Select a role blade")

17. Select the **BU-Electronics-Users group** and select **Save** to add the group to the role.

    ![BU-Electronics-Users is circled.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image42.png "BU-Electronics-Users")

Now both the security groups **BU-Electronics-Admins** and **BU-Electronics-Users** are both Owners of at the **DelegatedProjectDemoRG** scope and members of each security group have full control over the resource group and all of its resources.

## Exercise 3: Use Azure Blueprints to govern your Azure environment

Duration: 75 minutes

In this exercise you will create an Azure Blueprint at the Management Group scope to model your Azure environment using Azure Blueprint artifacts such as resource groups, Azure Resource Manager templates, resource locks, Azure Policy, and Azure RBAC.

### Help references

|    |            |
|----------|:-------------:|
| Overview of the Azure Blueprints service  | <https://docs.microsoft.com/azure/governance/blueprints/overview> |
| Understand resource locking in Azure Blueprints | https://docs.microsoft.com/azure/governance/blueprints/concepts/resource-locking |
| Azure Resource Manager overview | https://docs.microsoft.com/azure/azure-resource-manager/resource-group-overview |
| Understand the structure and syntax of Azure Resource Manager templates | https://docs.microsoft.com/azure/azure-resource-manager/resource-group-authoring-templates |
| Get compliance data of Azure resources | https://docs.microsoft.com/azure/governance/policy/how-to/get-compliance-data |

### Task 1: Create a new Azure Blueprint

In this task, you will create a new Azure Blueprint and add several artifacts to the blueprint. You will then save a draft of the blueprint.

1. In the Azure portal at <https://portal.azure.com> navigate to the Azure Blueprints service by selecting **All services**, searching for **Blueprints**, and then selecting **Blueprints**.

    ![Blueprints service under the All services menu.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image117.png "Azure Blueprints under All services in the Azure portal")

    > **Tip**: You can pin the Blueprints service to the portal navigation by selecting the star next to **Blueprints**.

2. In the **Getting started** blade, select **Create** under the *Create a blueprint* heading.

    ![Getting started blade with the Create button under Create a blueprint highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image118.png "Create a blueprint")

3. Select **Start with a blank blueprint**.

    ![Choose a blueprint sample blade with the Blank Blueprint tile highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image119.png "Create a blank blueprint")

4. In the **Create blueprint** blade, enter the following to complete the form:

		- Blueprint name: **governance-baseline**
		- Blueprint description: **The governance-baseline blueprint will be applied to all subscriptions within the ERC management group.**
		- Definition location: **Enterprise Ready Cloud** management group

    ![Create blueprint blade with the form completed.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image120.png "Create blueprint")

5. Select **Next : Artifacts >>**.

6. Select **+ Add artifact...** and then select **Policy assignment** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image121.png "Add artifact")

7. Select the **Require specified tag on resource groups** policy and select **Add**.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected and the Require specified tag on resource groups policy definition highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image132.png "Add artifact policy definition selection")

    >**Note**: In Exercise 2, Azure Policy was used to automatically tag resources as they were created in a resource group, but recall that any tags on the resource group itself were not inherited. Through this blueprint, we will ensure that the *IOCode* and *CostCenter* tags are enforced on each resource group that is created *and* that the tags that are set on the resource group are automatically inherited by any child resources.

8. Select **+ Add artifact...** and then select **Policy assignment** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image121.png "Add artifact")

9. Select the **Require specified tag on resource groups** policy and select **Add**.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected and the Require specified tag on resource groups policy definition highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image132.png "Add artifact policy definition selection")

    >**Note**: We need to add two of the same policy definition so we can enforce each tag for *IOCode* and *CostCenter*.

10. Select **+ Add artifact...** and then select **Policy assignment** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image121.png "Add artifact")

11. Select the **Append tag and its value from the resource group** policy and Select **Add**.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected and the Append tag and its value from the resource group policy definition highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image123.png "Add artifact policy definition selection")

12. Select **+ Add artifact...** and then select **Policy assignment** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image121.png "Add artifact")

13. Select the **Append tag and its value from the resource group** policy and Select **Add**.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected and the Append tag and its value from the resource group policy definition highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image123.png "Add artifact policy definition selection")

    >**Note**: We need to add two of the same policy definition so we can ensure each tag for *IOCode* and *CostCenter* is replicated from the resource group to any child resources.

14. Select **+ Add artifact...** and then select **Azure Resource Manager template (Subscription)** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Azure Resource Manager template (Subscription) artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image125.png "Add artifact")

15. Complete the form with the following information. This resource group will be used to demonstrate that the policy enacted in our blueprint is working by creating a resource group and then creating a storage account within that resource group.

		- Artifact display name: **BU-RG**

16. In the Template field, paste the following template and Select **Add**:

    ```json
    {
        "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentTemplate.json#",
        "contentVersion": "1.0.0.1",
        "parameters": {
            "rgName": {
                "type": "string",
                "metadata": {
                    "description": "The name of the resource group"
                }
            },
            "rgLocation": {
                "type": "string",
                "defaultValue": "eastus",
                "allowedValues": [
                    "eastus",
                    "westus",
                    "northeurope",
                    "westeurope",
                    "japanwest",
                    "japaneast"
                ],
                "metadata": {
                    "description": "The location of the resource group"
                }
            },
            "storagePrefix": {
                "type": "string",
                "maxLength": 11,
                "metadata": {
                    "description": "The prefix for the name of the storage account which will have a unique string appended to it"
                }
            },
            "IOCode": { 
                "type": "string",
                "metadata": {
                    "description": "The value of the IOCode tag that will be applied to the resource group"
                }
            },
            "CostCenter": { 
                "type": "string",
                "metadata": {
                    "description": "The value of the CostCenter tag that will be applied to the resource group"
                }
            }
        },
        "variables": {
            "storageName": "[concat(parameters('storagePrefix'), uniqueString(subscription().id, parameters('rgName')))]"
        },
        "resources": [
            {
                "type": "Microsoft.Resources/resourceGroups",
                "apiVersion": "2018-05-01",
                "location": "[parameters('rgLocation')]",
                "name": "[parameters('rgName')]",
                "tags": {
                    "IOCode": "[parameters('IOCode')]",
                    "CostCenter": "[parameters('CostCenter')]"
                },
                "properties": {}
            },
            {
                "type": "Microsoft.Resources/deployments",
                "apiVersion": "2018-05-01",
                "name": "storageDeployment",
                "resourceGroup": "[parameters('rgName')]",
                "dependsOn": [
                    "[resourceId('Microsoft.Resources/resourceGroups/', parameters('rgName'))]"
                ],
                "properties": {
                    "mode": "Incremental",
                    "template": {
                        "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                        "contentVersion": "1.0.0.0",
                        "parameters": {},
                        "variables": {},
                        "resources": [
                            {
                                "type": "Microsoft.Storage/storageAccounts",
                                "apiVersion": "2017-10-01",
                                "name": "[variables('storageName')]",
                                "location": "[parameters('rgLocation')]",
                                "kind": "StorageV2",
                                "sku": {
                                    "name": "Standard_LRS"
                                }
                            }
                        ],
                        "outputs": {}
                    }
                }
            }
        ],
        "outputs": {}
    }
    ```

    ![Add artifact blade in the Azure portal for an Azure Resource Manager template (Subscription) artifact with the Add button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image126.png "Add artifact")

    >**Note**: The template parameters will be determined at the time the blueprint is assigned. This allows us flexibility if we need to make a blueprint assignment multiple times and have it maintain a dynamic nature.

17. Save the blueprint as a draft by selecting the **Save Draft** button.

    ![Create blueprint blade in the Azure portal for with the Save Draft highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image127.png "Save Draft blueprint")

### Task 2: Publish a draft blueprint and assign it

In this task, you will publish the previously created blueprint and assign the blueprint to your subscription.

1. In the portal, select **Blueprint definitions** and then the **governance-baseline** blueprint created in the previous step.

    ![The Blueprint definitions blade in the Azure portal with the governance-baseline blueprint highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image128.png "Blueprint definitions")

2. Select **Publish blueprint**.

    ![The governance-baseline blueprint with the Publish blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image129.png "Publish blueprint")

3. Enter a version number (for example *1.0*) in the **Version** field and select **Publish**.

4. Select **Assign blueprint**.

    ![The governance-baseline blueprint with the Assign blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image130.png "Assign blueprint button")

5. In the **Assign blueprint** blade, select your target **Subscription**, location (making sure to select a location your previous policy allows such as East US), and then scroll down to the **Artifact parameters** section of the blade.

    ![The governance-baseline blueprint Assign blueprint form.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image131.png "Assign blueprint")

6. Complete the **Artifact parameters** section of the blade with the following:

		- Append tag and its value from the resource group - Tag Name: **IOCode**
		- Append tag and its value from the resource group - Tag Name: **CostCenter**
		- BU-RG
			- rgName: **EnterpriseITRG**
			- rgLocation: **eastus**
			- storagePrefix: **treyrsrch**
			- IOCode: **1000151**
			- CostCenter: **Enterprise IT**
		- Require specified tag on resource groups - Tag Name: **IOCode**
		- Require specified tag on resource groups - Tag Name: **CostCenter**

    ![The governance-baseline blueprint Assign blueprint form with the Artifact parameters section highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image133.png "Assign blueprint Artifact parameters")

7. Select **Assign**. You will see a notification that the blueprint assignment is being created.

    ![The governance-baseline blueprint assignment being created toast notification.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image134.png "Creating blueprint assignment")

8. You will receive an error that blueprint assignment cannot be made as the blueprint resource is disallowed by the *Service catalog* policy that was created in Exercise 1.

### Task 3: Update the Service catalog policy to allow blueprint assignments

In this task, you will update an existing policy that blocks the deployment of Blueprint assignments to your Azure subscriptions located in the Enterprise Ready Cloud (ERC) management group.

1. In the Azure portal, navigate to the Policy service.

2. Select the **Definitions** blade followed by the **Service catalog** policy.

    ![The Policy definitions blade in the Azure portal with the Service catalog policy highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image135.png "Policy definitions")

3. Select **Edit definition**.

    ![The Service catalog policy with the Edit definition button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image136.png "Edit definition")

4. Add the following after the `Microsoft.Insights` source and Select **Save**.

    ```json
    {
        "source": "action",
        "like": "Microsoft.BluePrint/blueprintAssignments/*"
    }
    ```

    ![The Service catalog policy in edit mode with a portion of the new policy highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image137.png "Edit definition")

### Task 4: Assign a blueprint

In this task you will make a blueprint assignment of a published blueprint to an Azure subscription.

1. In the Azure portal, navigate to the Blueprints service.

2. Select **Blueprint definitions** and then the **governance-baseline** blueprint created in the previous task.

    ![The Blueprint definitions blade in the Azure portal with the governance-baseline blueprint highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image128.png "Blueprint definitions")

3. Select **Assign blueprint**.

    ![The governance-baseline blueprint with the Assign blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image130.png "Assign blueprint button")

4. In the **Assign blueprint** blade, select your target **Subscription**, location (making sure to select a location your previous policy allows such as East US), and then scroll down to the **Artifact parameters** section of the blade.

    ![The governance-baseline blueprint Assign blueprint form.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image131.png "Assign blueprint")

5. Complete the **Artifact parameters** section of the blade with the following:

		- Append tag and its value from the resource group - Tag Name: **IOCode**
		- Append tag and its value from the resource group - Tag Name: **CostCenter**
		- BU-RG
			- rgName: **EnterpriseITRG**
			- rgLocation: **eastus**
			- storagePrefix: **treyrsrch**
			- IOCode: **1000151**
			- CostCenter: **Enterprise IT**
		- Require specified tag on resource groups - Tag Name: **IOCode**
		- Require specified tag on resource groups - Tag Name: **CostCenter**

    ![The governance-baseline blueprint Assign blueprint form with the Artifact parameters section highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image133.png "Assign blueprint Artifact parameters")

6. Select **Assign**. You will see a notification that the blueprint assignment is being created.

    ![The governance-baseline blueprint assignment being created toast notification.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image134.png "Creating blueprint assignment")

7. Now that the *Service catalog* policy has been updated, the blueprint assignment will be successful. 

    ![The governance-baseline blueprint assignment success toast notification.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image138.png "Blueprint assignment created")

8. Select the **Blueprint assignment succeeded** link in the notification to view the status of the blueprint. 

### Task 5: Verify blueprint assignment and resource creation

In this task you will verify that the resource artifacts from the blueprint assignment have been created and that the policies deployed as a part of the assignment are operating as designed.

1. In the Azure portal, select **Resource groups** followed by the **EnterpriseITRG** resource group.

    ![Selecting the EnterpriseITRG resource group in the Azure portal.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image139.png "Resource group selection")

2. Note that both the *IOCode* and *CostCenter* tags have been applied to the resource group. The application of these tags was done through the Azure Resource Manager template that was an artifact within the blueprint assignment.

    ![The EnterpriseITRG in the Azure portal with the IOCode and CostCenter tags highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image140.png "Resource group tags")

3. Next, select the storage account prefixed with *treyrsrch*.

4. In the **Overview** pane, note the tags for *IOCode* and *CostCenter* have been inherited from the parent resource group. These tags were not a part of the Azure Resource Manager template and are a product of the Azure Policy artifacts in the blueprint.

    ![The treyrsrch storage account in the Azure portal with the IOCode and CostCenter tags highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image141.png "Resource tags")

### Task 6: Editing blueprints

In this task, you will edit the existing blueprint to add an additional policy to audit for the compliance of the resource group tag(s) matching the tags of child resources and publish the updated blueprint to your Azure subscription.

The policy required to audit for the match of a given tag name and value is a custom policy. To leverage the policy within a blueprint, we first need to create the policy at the same scope as our blueprint, which in this case is the Enterprise Ready Cloud (ERC) management group.

1. In the Azure portal, navigate to the Policy service.

2. Select **Definitions** and then select **+ Policy definition**.

    ![Policy definitions blade in the Azure portal with the Add policy definition button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image143.png "Add policy definition")

3. In the **New Policy definition** form, enter the following values:

		- Definition location: **Enterprise Ready Cloud**
		- Name: **Audit tag and its value from the resource group**.
		- Description: **Audit tag and its value from the resource group**.
		- Category: **(Create new) Tagging**
		- Policy rule: **Use the definition in the following code block**:

    ```json
    {
        "mode": "Indexed",
        "parameters": {
            "tagName": {
                "type": "String",
                "metadata": {
                    "displayName": "Tag Name",
                    "description": "Name of the tag, such as 'environment'"
                }
            }
        },
        "policyRule": {
            "if": {
                "not": {
                    "field": "[concat('tags[', parameters('tagName'), ']')]",
                    "equals": "[resourceGroup().tags[parameters('tagName')]]"
                }
            },
            "then": {
                "effect": "audit"
            }
        }
    }
    ```

    ![Adding a new policy definition to audit that a given tag on resource group is the same name and value on child resources.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image144.png "New policy definition")

4. Select **Save**.

5. To simplify the management of our blueprint, next we will create a new initiative definition for use in the existing governance-baseline blueprint. Select **Definitions** followed by **+ Initiative definition**.

    ![In the Azure portal, select Definitions followed by Add initiative definition.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image145.png "Add initiative definition")

6. In the **New Initiative definition** form, enter the following values:

		- Definition location: **Enterprise Ready Cloud**
		- Name: **Governance Baseline Initiative**
		- Description: **Governance Baseline Initiative for use in the governance-baseline blueprint**.
		- Category: **(Use existing) Tagging**

7. Add the following policies to the initiative and set the parameters to the following:

			- **Audit tag and its value from the resource group**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_1**
			- **Audit tag and its value from the resource group**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_2**
			- **Require specified tag on resource groups**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_1**
			- **Require specified tag on resource groups**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_2**
			- **Append tag and its value from the resource group**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_1**
			- **Append tag and its value from the resource group**
				- Value(s): **Use Initiative Parameter**
					- **TAGNAME_2**

    The form should look like the following:

    ![Creation of a new initiative definition at the ERC scope.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image146.png "New initiative definition")

8. Select **Save**. This new initiative definition allows us to consolidate all of the policy assignments in our existing blueprint to ensure the presence of the *IOCode* and *CostCenter* tags on resource groups and that child resources not only have those tags, but that their values match the parent resource group as well.

9. In the Azure portal, navigate to the Blueprints service.

10. Select **Blueprint definitions** and then the **governance-baseline** blueprint created in the previous task.

    ![The Blueprint definitions blade in the Azure portal with the governance-baseline blueprint highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image128.png "Blueprint definitions")

11. Select **Edit blueprint**.

    ![The Blueprint definitions blade in the Azure portal with the governance-baseline open and the Edit blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image142.png "Edit blueprint")

12. Select **Next : Artifacts >>**.

13. Select **+ Add artifact...** and then select **Policy assignment** for the **Artifact type** in the **Add artifact** blade.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image121.png "Add artifact")

14. Select the **Governance Baseline Initiative** and select **Add**.

    ![Add artifact blade in the Azure portal with the Policy assignment artifact type selected and the Governance Baseline Initiative highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image147.png "Add artifact")

15. Remove the other remaining policy assignments which are now included in the **Governance Baseline Initiative** by selecting the ellipsis (...) and then **Remove**.

    ![Removing the existing policy assignments from the blueprint.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image148.png "Remove artifact")

16. When you are finished removing the policies, you should be left with the *Azure Resource Manager template* artifact and the *Policy assignment* artifact for the selected initiative definition.

    ![The governance-baseline blueprint with only two artifacts remaining.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image149.png "governance-baseline blueprint")

17. Save the blueprint as a draft by selecting the **Save Draft** button.

    ![Create blueprint blade in the Azure portal for with the Save Draft highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image127.png "Save Draft blueprint")

18. Select **Publish blueprint**.

    ![The governance-baseline blueprint with the Publish blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image150.png "Publish blueprint")

19. Enter a version number (for example *2.0*) in the **Version** field and Select **Publish**.

20. Select **Assign blueprint**.

    ![The governance-baseline blueprint with the Assign blueprint button highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image151.png "Assign blueprint button")

21. In the **Assign blueprint** blade, select your target **Subscription**, enter an updated assignment name such as **Assignment-governance-baseline-2**, select a location (making sure to select a location your previous policy allows such as East US), make sure the latest version of the blueprint is selected, and then scroll down to the **Artifact parameters** section of the blade.

    ![The governance-baseline blueprint Assign blueprint form.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image152.png "Assign blueprint")

22. Complete the **Artifact parameters** section of the blade with the following:

		- BU-RG
			- rgName: **EnterpriseITRG**
			- rgLocation: **eastus**
			- storagePrefix: **treyrsrch**
			- IOCode: **1000151**
			- CostCenter: **Enterprise IT**
		- Governance Baseline Initiative
			- Tag Name: **IOCode**
			- Tag Name: **CostCenter**

    ![The governance-baseline blueprint Assign blueprint form with the Artifact parameters section highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image153.png "Assign blueprint Artifact parameters")

23. Select **Assign**. You will see a notification that the blueprint assignment is being created.

    ![The governance-baseline blueprint assignment being created toast notification.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image154.png "Creating blueprint assignment")

24. To view the status of the blueprint deployment, in the Azure portal, navigate to the Blueprints service.

25. Select **Assigned blueprints** followed by **Assignment-governance-baseline-2**.

    ![The blueprint assignments blade in the Azure portal with the Assignment-governance-baseline-2 blueprint assignment highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image155.png "Blueprint assignments")

26. Wait for the deployment to complete. You will see a message of **Assignment succeeded** upon completion.

    ![The blueprint assignment blade in the Azure portal for the governance-baseline blueprint with the Assignment succeeded message highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image156.png "governance-baseline blueprint assignment")

    >**Note**: Notice that because we used the same values for the resource group and storage account prefix parameters, the Azure Resource Manager template artifact in the blueprint assignment was able to reconcile the existing resources not and not create new ones.

### Task 7: Verify compliance with Azure Policy

In this task you will explore the compliance features of Azure Policy by working with the previously created audit policy that was a part of the *Governance Baseline Initiative* initiative definition created in the *Enterprise Ready Cloud* management group.

1. Launch the Azure Cloud Shell and select PowerShell. If prompted to create storage, Select the **Create storage** button.

    ![Azure portal screenshot showing the button to launch the Azure Cloud Shell.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image93.png "Azure Cloud Shell launch button")

    ![Azure portal screenshot showing the Azure Cloud Shell first launch experience.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image94.png "Azure Cloud Shell PowerShell")

2. Execute the following script to create a new resource group.

    ```powershell
    az group create -n MarketingRG -l eastus --tags IOCode=1000150 CostCenter=Marketing
    ```

3. Execute the following script to move the existing storage account in *EnterpriseITRG* to the resource group *MarketingRG*. When prompted, select **Yes** to initiate the move.

    ```powershell
    $resource = Get-AzResource -ResourceGroupName EnterpriseITRG | Where-Object { $_.Name -like "treyrsrch*" -and $_.ResourceType -eq "Microsoft.Storage/storageAccounts" }
    Move-AzResource -DestinationResourceGroupName MarketingRG -ResourceId $resource.ResourceId
    ```

    ![Azure Cloud Shell screenshot showing the move request for a resource from one resource group to another.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image157.png "Azure Cloud Shell PowerShell")

    >**Note**: It will take several minutes for the move to complete. Do not proceed to the next step until the script has completed.

4. Execute the following script to view the tags on the *MarketingRG* resource group and the moved storage account. Do the tags match?

    ```powershell
    Invoke-Command -ScriptBlock { 
        Write-Output "Resource group tags:"
        Write-Output (Get-AzResourceGroup -Name MarketingRG).Tags
        Write-Output "Storage account tags:"
        Write-Output (Get-AzResource -ResourceGroupName MarketingRG | Where-Object { $_.Name -like "treyrsrch*" -and $_.ResourceType -eq "Microsoft.Storage/storageAccounts" }).Tags
    }
    ```

    >**Note**: In this case the tags to not match. The Azure Policy which appends tags from the resource group to child resources only effects create and update operations and not move operations.

5. In addition to Azure PowerShell and the Azure CLI, Azure Policy can be used to view the compliance of your resources through both the Azure portal and the command line.

6. Navigate to the Policy service in the Azure portal and select **Compliance** followed by **Governance Baseline Initiative**.

    ![Azure Policy compliance in the Azure Portal with the Governance Baseline Initiative highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image158.png "Azure policy compliance")

7. On the **Initiative compliance** blade, select one of the **Audit tag and its value from the resource group** policies.

    ![A screenshot of the Initiative compliance blade in the Azure Portal for the Governance Baseline Initiative with one of the Audit tag and its value from the resource group policies highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image159.png "Initiative compliance")

8. On the **Policy compliance** blade, you can view all of the non-compliant resources.

    ![A screenshot of the Policy compliance blade in the Azure Portal for the Governance Baseline Initiative with one of the Audit tag and its value from the resource group policies highlighted.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image160.png "Policy compliance")

    >**Note**: This is an audit policy, not a deny policy, so it does not prevent the creation of resources, but it can surface resource that do not meet your organizational standards and offer a clear line of sight to remediation.

9. You may (or may not) see the non-compliant state of the storage account that was moved earlier. Azure policy compliance checks do not currently have a published SLA for how long it takes an initial compliance check to occur or how long it takes for ongoing compliance checks to occur.

    It is often on the order of the less than 20-30 minutes for evaluation and when the next check occurs the storage account that was moved earlier will be flagged as non-compliant, because while the tag names for the child resources in the *MarketingRG* for *CostCenter* and *IOCode* are present, their values on the storage account do not match the parent the values of the tags on the parent resource group.

    ![A screenshot of the Resource compliance blade in the Azure Portal for the Governance Baseline Initiative and the Audit tag and its value from the resource group policy.](images/Hands-onlabstep-by-step-Enterprise-readycloudimages/media/image160.png "Resource compliance")

## After the hands-on lab

Duration: 10 minutes

After completing the hands-on lab, you will remove the policies on your subscription.

### Task 1: Remove resources and configuration created during this lab

1. Log in to the Azure portal.

2. Navigate to the **Blueprints** blade.

3. Remove any blueprint assignments and any blueprints created during this lab.

4. Navigate to the **Policy** blade.

5. Select **Assignments**, and delete all policy assignments created during this lab.

6. Select **Definitions**, and delete any policy definitions or initiative definitions created during this lab.

7. Navigate to the **Management Groups** blade.

8. Remove any Management Groups crated during this lab.

9. Navigate to the **Resource Groups** blade.

10. Remove any resource groups created during this lab. 

   >**Note**: This will also delete any resources in those resource groups.

11. Navigate to the **Azure Active Directory** blade.

12. Remove any users and groups created during this lab.

You should follow all steps provided *after* attending the Hands-on lab.