# Lab3: AKS

Kubernetes provides a distributed platform for containerized applications. With AKS, you can quickly create a production ready Kubernetes cluster. In this tutorial we will deploy a Kubernetes cluster in AKS. 

In this lab you will: 

* Create a new resource group for AKS cluster
* Deploy a Kubernetes AKS cluster from Basj
* Deploy a multi-tier application 
* Scale the application 
* Perform a rolling update

## Prerequisites

Before you begin, set the following environment variables:

```bash
# Set your Azure location, resource group and cluster name
export LOCATION=westus
export RG_NAME=azaks<your_initials>
export AKS_CLUSTER_NAME=myAKSCluster
```

Navigate to the location of `03-aks\manifests` directory from within the WSL environment

## Create new resource group 
1. Log into Azure Cloud using the command `az login`
2. Run the following command to create a new resource group.
```bash
az group create --location $LOCATION --name $RG_NAME
```

## Create a Kubernetes cluster

Create an AKS cluster using `az aks create`. The following example creates a cluster named `$AKS_CLUSTER_NAME` in the resource group `$RG_NAME`.  

```azurecli
az aks create \
    --resource-group $RG_NAME \
    --name $AKS_CLUSTER_NAME \
    --node-count 2 \
    --node-vm-size "Standard_DS2_v2" \
    --generate-ssh-keys
```

After a few minutes, the deployment completes, and returns JSON-formatted information about the AKS deployment.

> **NOTE**
> To ensure your cluster to operate reliably, you should run at least 2 (two) nodes.  
> AKS requires system node pool VMs to have at least 2 vCPUs and 4GB of RAM.

## Connect to cluster using kubectl

To configure `kubectl` to connect to your Kubernetes cluster, use the [az aks get-credentials][] command:

```azurecli
az aks get-credentials \
    --resource-group $RG_NAME \
    --name $AKS_CLUSTER_NAME
```

> **NOTE - Only applies to WSL**
> When you run: `az aks get-credentials ...` from Windows (CMD or PowerShell), it modifies the Windows ~/.kube/config, i.e.:
> C:\Users\yourname\.kube\config
> But when you run kubectl inside WSL, it looks for the config in:
> /home/yourname/.kube/config
> So kubectl inside WSL is unaware of the credentials downloaded on the Windows side.
> To fix this run the following command inside WSL:
```bash
mkdir -p ~/.kube
cp /mnt/c/Users/yourname/.kube/config ~/.kube/config
```

To verify the connection to your cluster, run the [kubectl get nodes][kubectl-get] command:

```
$ kubectl get nodes

NAME                                STATUS   ROLES    AGE     VERSION
aks-nodepool1-21636907-vmss000000   Ready    <none>   4m25s   v1.31.8
aks-nodepool1-21636907-vmss000001   Ready    <none>   4m18s   v1.31.8
```

## Deploy multi-tier application
This lab shows you how to build, deploy and manage a simple, multi-tier web application using Kubernetes.

We will be deploying the guestbook demo application which is made up of Redis master, Redis slave, and guestbook frontend.  After successfully deploying we will update the application and then rollback to the previous version.

**NOTE:** Lab files are found in `03-aks` directory

## Start up Redis Master
The guestbook application uses Redis to store its data. It writes data to a Redis master instance and reads data from multiple Redis slave instances.

### Creating the Redis Master Deployment
The manifest file, included below, specifies a Deployment controller that runs a single replica Redis master Pod.

Apply the Redis Master deployment file
```
kubectl apply -f manifests/redis-master-deployment.yaml
```

Verify the Redis master is running
```
kubectl get pods
```
You should see something like:
```
NAME                            READY     STATUS    RESTARTS   AGE
redis-master-585798d8ff-s9qmr   1/1       Running   0          44s
```

Now let’s check the logs
```
kubectl logs -f <POD NAME>
```

If everything looks good press `Ctrl + C` and continue

### Create the Redis Master Service
The guestbook applications needs to communicate to the Redis master to write its data. You need to apply a Service to proxy the traffic to the Redis master Pod. A Service defines a policy to access the Pods.

Apply the Service
```
kubectl apply -f manifests/redis-master-service.yaml
```

This manifest file creates a Service named redis-master with a set of labels that match the labels previously defined, so the Service routes network traffic to the Redis master Pod.

Confirm service is running
```
kubectl get svc
```

You should see running service
```
NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
kubernetes     ClusterIP   10.96.0.1      <none>        443/TCP    34m
redis-master   ClusterIP   10.107.62.78   <none>        6379/TCP   56s
```

## Start up the Redis Slaves
Although the Redis master is a single pod, you can make it highly available to meet traffic demands by adding replica Redis slaves.

### Create Redis Slave Deployment
Deployments scale based off of the configurations set in the manifest file. In this case, the Deployment object specifies two replicas.
If there are not any replicas running, this Deployment would start the two replicas on your container cluster. Conversely, if there are more than two replicas are running, it would scale down until two replicas are running.

Apply the Redis slave deployment
```
kubectl apply -f manifests/redis-slave-deployment.yaml
```

Confirm it’s running successfully.
```
kubectl get pods
```

You should now see the following
```
NAME                            READY     STATUS    RESTARTS   AGE
redis-master-585798d8ff-s9qmr   1/1       Running   0          6m
redis-slave-865486c9df-bf68k    1/1       Running   0          8s
redis-slave-865486c9df-btg6h    1/1       Running   0          8s
```

### Create Redis Slave service
The guestbook application needs to communicate to Redis slaves to read data. To make the Redis slaves discoverable, you need to set up a Service. A Service provides transparent load balancing to a set of Pods.

Apply Redis Slave Service
```
kubectl apply -f manifests/redis-slave-service.yaml
```

Confirm services are running
```
kubectl get services
```

You should see:
```
NAME           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
kubernetes     ClusterIP   10.96.0.1      <none>        443/TCP    38m
redis-master   ClusterIP   10.107.62.78   <none>        6379/TCP   5m
redis-slave    ClusterIP   10.98.54.128   <none>        6379/TCP   35s
```

## Setup and Expose the Guestbook Frontend
The guestbook application has a web frontend serving the HTTP requests written in PHP. It is configured to connect to the `redis-master` Service for write requests and the `redis-slave` service for Read requests.

## Create the Guestbook Frontend Deployment
Apply the YAML file using the `--record` flag.
NOTE: We are using the `--record` flag to keep a history of the deployment, which enables us to rollback.
```
kubectl apply --record -f manifests/frontend-deployment.yaml
```

Now let’s verify they are running
```
kubectl get pods -l app=guestbook -l tier=frontend
```

You should see something like this
```
NAME                       READY     STATUS    RESTARTS   AGE
frontend-67f65745c-jwhdw   1/1       Running   0          27s
frontend-67f65745c-lxpxj   1/1       Running   0          27s
frontend-67f65745c-tsq9k   1/1       Running   0          27s
```

### Create the Frontend Service
The `redis-slave` and `redis-master` Services you applied are only accessible within the container cluster because the default type for a Service is `ClusterIP`. ClusterIP provides a single IP address for the set of Pods the Service is pointing to. This IP address is accessible only within the cluster.

If you want guests to be able to access your guestbook, you must configure the frontend Service to be externally visible, so a client can request the Service from outside the container cluster.

Apply the Frontend Service
```
kubectl apply -f manifests/frontend-service.yaml
```

Confirm the service is running
```
kubectl get services frontend
```

You should see something like this
```
NAME       TYPE           CLUSTER-IP   EXTERNAL-IP    PORT(S)        AGE
frontend   LoadBalancer   10.0.75.61   13.83.250.51   80:31383/TCP   93s
```

### Viewing the Frontend Service
To load the front end in a browser visit your 'External-IP'

In the example above we can see that `frontend` Service is running on port 80 so I would visit the following in a web browser

`http://<EXTERNAL-IP>`

## Scale Web Frontend
Scaling up or down is easy because your servers are defined as a Service that uses a Deployment controller.

Run the following command to scale up the number of frontend Pods:
```
kubectl scale deployment frontend --replicas=5
```

Now verify the Pods increased to specified number of replicas
```
kubectl get pods -l app=guestbook -l tier=frontend
```

To scale back down run
```
kubectl scale deployment frontend --replicas=2
```

Now check to see if Pods are being destroyed
```
kubectl get pods -l app=guestbook -l tier=frontend
```

## Update frontend image

Confirm the version of the image you are using
```
kubectl describe deployment frontend |grep Image
```

You should see `v5`
```
Image:      gcr.io/google-samples/gb-frontend:v5
```

Now we are going to update our YAML file
```
vim manifests/frontend-deployment.yaml
```

Replace `v5` with `v6` so it looks like below:
```
..snip
- name: php-redis
        image: gcr.io/google-samples/gb-frontend:v6
```

Now save the file and deploy the new version
```
kubectl apply --record -f  manifests/frontend-deployment.yaml
```

Run the following to see that the Pods are being updated
```
kubectl get pods -l tier=frontend
```

You should see some Pods being terminated and image pull errors
```
NAME                            READY     STATUS              RESTARTS   AGE
NAME                        READY   STATUS             RESTARTS   AGE
frontend-75c448f886-97flg   1/1     Running            0          7m28s
frontend-75c448f886-gbv2d   1/1     Running            0          4m29s
frontend-75c448f886-rgxpr   1/1     Running            0          14s
frontend-77bdc497bc-hll7q   0/1     ImagePullBackOff   0          14s
```

Great!  Now you can confirm it updated to `v6`
```
kubectl describe deployment frontend | grep Image
```

## Rollback deployment
Now something went wrong during our update, and we need to rollback to a previous version of our application.

As long as we used the `--record` option when deploying this is easy.

Run the following to check the rollout history
```
kubectl rollout history deployment frontend
```

```
REVISION  CHANGE-CAUSE
1         kubectl apply --record=true --filename=manifests/frontend-deployment.yaml
2         kubectl apply --record=true --filename=manifests/frontend-deployment.yaml
3         kubectl apply --record=true --filename=manifests/frontend-deployment.yaml
```

To see the changes made for each revision we can run the following, replacing `--revision` with the one you want to know more about
```
kubectl rollout history deployment frontend --revision=2
```

Now to rollback to our previous revision we can run:
```
kubectl rollout undo deployment frontend
```

If we needed to choose a version previous to our last we can specify it:
```
kubectl rollout undo deployment frontend --to-revision=1
```

What does the rollout history look like now?
```
kubectl rollout history deployment frontend
```

Remember when you rolled back the previous version it changed the order of deployment revisions.

Use the following command to see details about each deployment revision, replacing `<number>` with the actual revision number.
```
kubectl rollout history deployment/frontend --revision=<number>
```

## Cleanup

Now delete your AKS cluster to avoid unexpected billing:

```bash
az aks delete \
    --resource-group $RG_NAME \
    --name $AKS_CLUSTER_NAME \
    --yes
```
