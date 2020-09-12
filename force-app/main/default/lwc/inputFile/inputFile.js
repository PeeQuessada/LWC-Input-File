import { LightningElement, api, track } from 'lwc';
import getDocuments from '@salesforce/apex/InputFile.getDocuments';
import createDocument from '@salesforce/apex/InputFile.createDocument';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class InputFile extends LightningElement {

    @api title = 'Adicionar arquivo';
    @api recordId;
    @track documents;
    @track error;
    @track fileName = '';
    @track UploadFile = 'Upload File';
    @track showLoadingSpinner = false;
    @track isTrue = false;
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;

    getFiles() {
        getDocuments({
            recordId: this.recordId
        })
        .then(result => {
            this.track = result;
        })
        .catch(error => {
            this.error = error;
        });
    }

    click(event){
        console.log('click');
    }

    async change(event){

        if(event.target.files.length > 0){
            console.log('maior de zero');
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        } 
        else {
            console.log('zero');
        }
        try {
            this.uploadHelper();
        } catch (error) {
            console.log('erro: ' + error);
        }
    }

    uploadHelper() {
        this.file = this.filesUploaded[0];
        if (this.file.size > this.MAX_FILE_SIZE) {
            window.console.log('File Size is to long');
            return ;
        }
        this.showLoadingSpinner = true;
        // create a FileReader object 
        this.fileReader= new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);
            
            // call the uploadProcess method 
            this.saveToFile();
        });
    
        this.fileReader.readAsDataURL(this.file);
    }

    // Calling apex class to insert the file
    saveToFile() {
        createDocument({ recordId: this.recordId, filename: this.file.name, base64: encodeURIComponent(this.fileContents)})
        .then(result => {
            window.console.log('result ====> ' +result);
            // refreshing the datatable
            this.getRelatedFiles();

            this.fileName = this.fileName + ' - Uploaded Successfully';
            this.UploadFile = 'File Uploaded Successfully';
            this.isTrue = true;
            this.showLoadingSpinner = false;

            // Showing Success message after file insert
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: this.file.name + ' - Uploaded Successfully!!!',
                    variant: 'success',
                }),
            );

        })
        .catch(error => {
            // Showing errors if any while inserting the files
            window.console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error while uploading File',
                    message: error.message,
                    variant: 'error',
                }),
            );
        });
    }

}