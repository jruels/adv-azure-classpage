configuration ContosoWebsite {
    param (
        [Parameter(Mandatory=$true)]
        [String]$NodeName
    )

    Import-DscResource -ModuleName PSDesiredStateConfiguration

    Node $NodeName {
        WindowsFeature IIS {
            Name = "Web-Server"
            Ensure = "Present"
        }

        File DefaultPage {
            Ensure = "Present"
            DestinationPath = "C:\\inetpub\\wwwroot\\Default.htm"
            Contents = "Hello from Contoso's IIS VM!"
            Type = "File"
            Force = $true
            DependsOn = "[WindowsFeature]IIS"
        }
    }
}
