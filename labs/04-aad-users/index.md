# Lab 4b: AAD Users
Add new users or delete existing users from your Azure Active Directory (Azure AD) organization.

## Add a new user
You can create a new user using the Azure Active Directory portal.

### To add a new user
1. Sign in to the [Azure portal](https://portal.azure.com/) as a User administrator for the organization.

2. Select **Azure Active Directory**, select **Users**, and then select **New user**.

  ![](index/new-user-all-users-blade.png)

3. On the **User** page, fill out the required information.

![](index/new-user-user-blade.png)

- **Name (required).** The first and last name of the new user. For example, Mary Parker.

- **User name (required).** The user name of the new user. For example, mary@contoso.com.  
    
The domain part of the user name must use either the initial default domain name, `<_yourdomainname_>.onmicrosoft.com`, or a custom domain name, such as contoso.com. 

- **Profile.** Optionally, you can add more information about the user. You can also add user information at a later time. 

- **Groups.** Optionally, you can add the user to one or more existing groups. You can also add the user to groups at a later time. 
   
- **Directory role.** Optionally, you can add the user to an Azure AD administrator role. You can assign the user to be a Global administrator or one or more of the limited administrator roles in Azure AD. 

4. Copy the auto-generated password provided in the **Password** box. You'll need to give this password to the user for the initial sign-in process.

5. Select **Create**.

   The user is created and added to your Azure AD tenant.

6. Open a new incognito browser window and log into the [Azure Portal](https://portal.azure.com) as the new user. 

## Delete a user
You can delete an existing user using Azure Active Directory portal.

### To delete a user
1. Sign in to the [Azure portal](https://portal.azure.com/) using a User administrator account for the organization.

2. Select **Azure Active Directory**, select **Users**, and then search for and select the user you want to delete from your Azure AD tenant. For example, _Mary Parker_.

3. Select **Delete user**.

    ![](index/delete-user-all-users-blade.png)

  The user is deleted and no longer appears on the **Users - All users** page. The user can be seen on the **Deleted users** page for the next 30 days and can be restored during that time. 
