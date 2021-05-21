DROP DATABASE IF EXISTS jurassic_park;

DROP USER IF EXISTS 'jurassic'@'%';
CREATE DATABASE jurassic_park CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER jurassic@'%' IDENTIFIED BY 'jurassic2020';
GRANT ALL PRIVILEGES ON jurassic_park.* TO jurassic@'%';
ALTER USER 'jurassic'@'%' IDENTIFIED WITH mysql_native_password BY 'jurassic2020';

USE jurassic_park;
SET foreign_key_checks = 1;

CREATE TABLE User(

    userId INT PRIMARY KEY AUTO_INCREMENT,
    userLoginName VARCHAR(30) NOT NULL UNIQUE,
    userPassword VARCHAR(300) NOT NULL,
    userName VARCHAR(100) NOT NULL

);

CREATE TABLE SmartComponent(

    scId INT PRIMARY KEY AUTO_INCREMENT,
    scName VARCHAR(50) NOT NULL,
    scAddress VARCHAR(50) NOT NULL,
    scPort INT NOT NULL,
    scMemory VARCHAR(50),
    scCpu VARCHAR(50),
    scType VARCHAR(50),

    UNIQUE KEY(scAddress,scPort)

);

CREATE TABLE FBCategory(

    fbcId INT PRIMARY KEY AUTO_INCREMENT,
    fbcName VARCHAR(50) NOT NULL UNIQUE,
    fbcUserId INT,

    FOREIGN KEY(fbcUserId) references User(userId) ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE DigitalTwin(

    dtId INT PRIMARY KEY AUTO_INCREMENT,
    dtName VARCHAR(50) NOT NULL UNIQUE,
    dtUserId INT,

    FOREIGN KEY(dtUserId) references User(userId) ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE Functionality(

    funcId INT PRIMARY KEY AUTO_INCREMENT,
    funcName VARCHAR(50) NOT NULL UNIQUE,
    funcUserId INT,
    funcdtId INT NOT NULL,

    FOREIGN KEY(funcdtId) references DigitalTwin(dtId) ON UPDATE CASCADE,
    FOREIGN KEY(funcUserId) references User(userId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE AssociatedSmartComponent(

    idAssociatedSmartComponent INT PRIMARY KEY AUTO_INCREMENT,
    scDtId INT NOT NULL,
    scName VARCHAR(50) NOT NULL UNIQUE,
    associatedScUserId INT,

    FOREIGN KEY(scDtId) references DigitalTwin(dtId) ON UPDATE CASCADE
);

CREATE TABLE MonitoredVariable(

    idMonitoredVariable INT PRIMARY KEY AUTO_INCREMENT,
    funcIdAssociated INT NOT NULL,
    monitoredVariableName VARCHAR(50) NOT NULL,
    fbAssociated VARCHAR(50) NOT NULL,
    scAssociated VARCHAR(50) NOT NULL
);

CREATE TABLE MonitoredEvent(

    idMonitoredEvent INT PRIMARY KEY AUTO_INCREMENT,
    funcIdAssociated INT NOT NULL,
    monitoredEventName VARCHAR(50) NOT NULL,
    fbAssociated VARCHAR(50) NOT NULL,
    scAssociated VARCHAR(50) NOT NULL
);

CREATE TABLE FunctionBlock(

    fbId INT PRIMARY KEY AUTO_INCREMENT,
    fbType VARCHAR(50) NOT NULL UNIQUE,
    fbDescription VARCHAR(200) NOT NULL,
    fbUserId INT,
    fbFbcId INT NOT NULL,
    fbGeneralCategory ENUM('DEVICE.SENSOR','SERVICE','POINT.STARTPOINT','POINT.ENDPOINT','DEVICE.EQUIPMENT') NOT NULL,
    fbSize INT,

    FOREIGN KEY(fbFbcId) references FBCategory(fbcId) ON UPDATE CASCADE,
    FOREIGN KEY(fbUserId) references User(userId) ON DELETE SET NULL ON UPDATE CASCADE

);

CREATE TABLE Installation(

    installationScId INT NOT NULL,
    installationFbId INT NOT NULL,

    PRIMARY KEY(installationScId,installationFbId),
    FOREIGN KEY(installationScId) references SmartComponent(scId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(installationFbId) references FunctionBlock(fbId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE DownloadHistory(

    dhId INT PRIMARY KEY AUTO_INCREMENT,
    dhInstallationDate INT NOT NULL,
    dhScId INT NOT NULL,
    dhFbId INT NOT NULL,

    FOREIGN KEY(dhScId,dhFbId) references Installation(installationScId,installationFbId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE Application(

    applicationId INT PRIMARY KEY AUTO_INCREMENT
    
);

CREATE TABLE FBInstance(

    fbiApplicationId INT NOT NULL,
    fbiScId INT NOT NULL,
    fbiFbId INT NOT NULL,
    fbiState ENUM('OK','Error'),
    fbiTimeLastContact INT,

    PRIMARY KEY(fbiApplicationId,fbiScId,fbiFbId),
    FOREIGN KEY(fbiApplicationId) references Application(applicationId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(fbiScId,fbiFbId) references Installation(installationScId,installationFbId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE Event(

    eventId INT PRIMARY KEY AUTO_INCREMENT,
    eventName VARCHAR(50) NOT NULL,
    eventType VARCHAR(50) NOT NULL,
    eventOpcua VARCHAR(75),
    eventInoutType ENUM('IN', 'OUT'),
    eventFbId INT NOT NULL,

    UNIQUE KEY(eventName,eventFbId),

    FOREIGN KEY(eventFbId) references FunctionBlock(fbId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE Variable(

    variableId INT PRIMARY KEY AUTO_INCREMENT,
    variableName VARCHAR(50) NOT NULL,
    variableOpcua VARCHAR(75),
    variableInoutType ENUM('IN', 'OUT'),
    variableDataType ENUM('STRING','INT','UINT','REAL','LREAL','BOOL'),
    variableFbId INT NOT NULL,

    UNIQUE(variableName,variableFbId),

    FOREIGN KEY(variableFbId) references FunctionBlock(fbId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE EventVariable (

    evEventId INT,
    evVariableId INT,
    evValid BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY(evEventId,evVariableId),
    FOREIGN KEY(evEventId) REFERENCES Event(eventId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(evVariableId) REFERENCES Variable(variableId) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE ExternalDependency (

    edId INT PRIMARY KEY AUTO_INCREMENT,
    edName VARCHAR(50) NOT NULL

);

CREATE TABLE FunctionBlockExternalDependency(

    fbedFbId INT NOT NULL,
    fbedEdId INT NOT NULL,
    fbEdVersion VARCHAR(20),

    PRIMARY KEY(fbedFbId,fbedEdId),
    FOREIGN KEY(fbedFbId) REFERENCES FunctionBlock(fbId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(fbedEdId) REFERENCES ExternalDependency(edId) ON DELETE CASCADE ON UPDATE CASCADE

);

DELIMITER $$

CREATE FUNCTION checkEventVariable (inEventId INT, inVariableId INT) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE localEventFbId INT;
    DECLARE localVariableFbId INT;
    DECLARE localEventInoutType VARCHAR(5);
    DECLARE localVariableInoutType VARCHAR(5);
    DECLARE result BOOLEAN;
    SELECT eventFbId,eventInoutType INTO localEventFbId,localEventInoutType FROM Event WHERE eventId=inEventId;
    SELECT variableFbId,variableInoutType INTO localVariableFbId,localVariableInoutType FROM Variable WHERE variableId=inVariableId;
    
    IF (localEventFbId = localVariableFbId AND localEventInoutType = localVariableInoutType ) THEN
        SET result = TRUE;
    ELSE
        SET result = FALSE;

    END IF;

    RETURN result;
END
$$


CREATE TRIGGER ValidEventVariableInsert BEFORE INSERT ON EventVariable

    FOR EACH ROW
    BEGIN
        IF NOT checkEventVariable(New.evEventId,New.evVariableId) THEN
            SET New.evValid = FALSE;
        END IF;
    END
$$

CREATE TRIGGER ValidEventVariableUpdate BEFORE UPDATE ON EventVariable

    FOR EACH ROW
    BEGIN
        IF NOT checkEventVariable(New.evEventId,New.evVariableId) THEN
            SET New.evValid = FALSE;
        END IF;
    END
$$

DELIMITER ;

INSERT INTO User(userLoginName,userPassword,userName) VALUES("admin","admin","admin");

INSERT INTO FBCategory(fbcName,fbcUserId) VALUES("Main",1);
INSERT INTO FBCategory(fbcName,fbcUserId) VALUES("Systec",1);

-- INSERT INTO FunctionBlock(fbType,fbDescription,fbGeneralCategory,fbFbcId,fbUserId) VALUES("MOVING_AVERAGE","Moving Average Function Block","SERVICE",1,1);

-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("INIT","Event",NULL,"IN",1); 
-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("RUN","Event","Method","IN",1); 

-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("INIT_O","Event",NULL,"OUT",1); 
-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("RUN_O","Event",NULL,"OUT",1); 

-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("WINDOW","Constant.RUN","IN","INT",1); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE","Variable.RUN","IN","REAL",1); 

-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE_MA","Variable.RUN","OUT","REAL",1); 

-- INSERT INTO EventVariable(evEventId,evVariableId) VALUES(2,2);
-- INSERT INTO EventVariable(evEventId,evVariableId) VALUES(4,3);


-- INSERT INTO FunctionBlock(fbType,fbDescription,fbGeneralCategory,fbFbcId,fbUserId) VALUES("INFLUX_DB_2","Write to a influxdb database","POINT.ENDPOINT",1,1);

-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("INIT","Event",NULL,"IN",2);
-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("RUN","Event",NULL,"IN",2); 

-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("INIT_O","Event",NULL,"OUT",2); 
-- INSERT INTO Event(eventName,eventType,eventOpcua,eventInoutType,eventFbId) VALUES("RUN_O","Event",NULL,"OUT",2); 

-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("HOST","Constant","IN","STRING",2);
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("PORT","Constant","IN","UINT",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("USER","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("PASSW","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("DBNAME","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("MEASUREMENT_NAME","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE_NAME_1","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE_NAME_2","Constant","IN","STRING",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE_1","Variable","IN","REAL",2); 
-- INSERT INTO Variable(variableName,variableOpcua,variableInoutType,variableDataType,variableFbId) VALUES("VALUE_2","Variable","IN","REAL",2); 

-- INSERT INTO EventVariable(evEventId,evVariableId) VALUES(6,12);
-- INSERT INTO EventVariable(evEventId,evVariableId) VALUES(6,13);
