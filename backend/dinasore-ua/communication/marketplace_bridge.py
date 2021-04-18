import requests
from pip._internal import main as pipmain
import os
import sys
import logging
from importlib import import_module
import threading
import subprocess
from ftplib import FTP
import time
import datetime
import json

class MarketplaceBridge: 

    fbDetailPath = '/function-block'
    announcePath = '/smart-component'

    protocol = 'http://'
    mpHttpAddress = ''
    mpHttpPort = ''
    mpFtpAddress = ''
    mpFtpPort = ''

    FTP_USER = os.environ['MP_FTP_USER']
    FTP_PASS = os.environ['MP_FTP_PASS']

    @classmethod
    def initializeGenericRequester(mp,mpHttpAddress,mpHttpPort,mpFtpAddress,opcAddress,opcPort,mpFtpPort=21,secure=False):

        mp.protocol = 'https://' if secure else 'http://' 
        mp.mpHttpAddress = mp.protocol + mpHttpAddress
        mp.mpHttpPort = mpHttpPort
        mp.mpFtpAddress = mpFtpAddress
        mp.mpFtpPort = mpFtpPort
        mp.ftp = FTP()
        mp.opcAddress = opcAddress
        mp.opcPort = opcPort


    @classmethod
    def getFbDetails(mp,fbType):

        path = mp.mpHttpAddress + ':' + str(mp.mpHttpPort) + mp.fbDetailPath + '/' + fbType
        request = requests.get(path)
        response = request.json()
        if response['state']['error'] == True:
            print('Function {} Block not found on Marketplace'.format(fbType))
            return {'error': True}
            
        fbInfo = response['result']
        fbCategory = fbInfo['fbCategoryName']
        fbExternalDependencies = fbInfo['fbExternalDependencies']
        return {'error': False, 'category': fbCategory, 'externalDependencies': fbExternalDependencies}

            

    @classmethod
    def downloadFunctionBlockFiles(mp, fbType, fbCategory, pyPath, fbtPath):

        print('downloading {} files'.format(fbType))
        try:
            mp.ftp.connect(mp.mpFtpAddress,mp.mpFtpPort)
            mp.ftp.login(mp.FTP_USER, mp.FTP_PASS)
            mp.ftp.cwd('{}/{}'.format(fbCategory,fbType))

            pyFile = open(pyPath,'wb')
            fbtFile = open(fbtPath,'wb')
            
            mp.ftp.retrbinary('RETR {}.py'.format(fbType), pyFile.write)
            mp.ftp.retrbinary('RETR {}.fbt'.format(fbType), fbtFile.write)

            pyFile.close()
            fbtFile.close()
            print('{} files downloaded.'.format(fbType))
            mp.ftp.quit()

        except Exception as e:
            print(e)
            print('Error downloading files for function block: {}'.format(fbType))


    @classmethod
    def announce(mp,soName):
        path = '{}:{}{}'.format(mp.mpHttpAddress,mp.mpHttpPort,mp.announcePath)
        data = json.dumps({'opcAddress': mp.opcAddress, 'opcPort': mp.opcPort, 'scName':soName})
        headers = {'Content-Type':'application/json'}
        announceRequest = requests.post(path,data=data,headers=headers)
        announceRequest.headers
        response = announceRequest.json()
        print(response)