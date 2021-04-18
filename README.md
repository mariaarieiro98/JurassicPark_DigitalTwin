# Marketplace-JurassicPark

Repositório para dissertação de João Furriel 

1. In folder backend/api run npm install
2. In folder backed/web run npm install
3. In ‘./backend/api/jurassic.config.json’ there are three important locations. There is no need to change what is already defined there.
    * 4._4diacLib: path to the folder containing the ftb files to be used by 4diac
    * functionBlocksFolder: path to the folder containing all the files to be served to the dinasores
    * functionBlocksBackupFolder: path to the folder containing a backup of all files
4. In the 4Diac typelibrary folder (/<path to 4diac installation folder>/Contents/Eclipse/typelibrary) create a softlink to the folder defined in 3a). Restart eclipse and the FB will appear in the typelibrary folder for projects newly created.
5. For a local configuration, to simulate dinosaurs with docker containers
    * In the docker-compose file we can see that there is a service for each of the dinasores we want to simulate, each one has a name and a mapping for ports, the iec61499 and another for the uac service. Do not map more than one dinasore to the same host port
    * For each one of the dinosaurs, make a copy of the resources folder under the dinasore-ua folder and make a volume mapping in the docker-compose file. Check one for an example
    * To run a dinasore, open a bash terminal in the container. (As an example, for a dinasore called d_dinasore_1 execute “docker exec -it d_dinasore1 bash” and, once running inside the container execute the command “python core/main.py -a d_dinasore1 -p 61499 -u 4840 -l ERROR -m 5 20 -mha d_api -mhp 3000 -mfa d_ftp”
    * From this moment on, the dinasore is available on the docker network and can be used in the 4DIAC IDE.
6. Tu run the project
    * Inside the backend folder run “docker-compose up”
    * Inside the backend/web folder run “npm start”
