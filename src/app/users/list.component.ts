import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import * as xlsx from 'xlsx';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    users = null;
    file: any;
    arrayBuffer:any
    worksheet:any
    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }
    //import excel
    getFile(event: any) {
        this.file = event.target.files[0];
        
        const classe = {
          nom: null,
          prenom: null,
          email: null,
          password: null
        };
        
        this.fileReader(this.file, classe);
      }
      private fileReader(file: any, line: any) {
        let fileReader = new FileReader();
    
        fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          const data = new Uint8Array(this.arrayBuffer);
          const arr = new Array();
    
          for (let i = 0; i !== data.length; i++) {
            arr[i] = String.fromCharCode(data[i]);
          }
    
          const bstr = arr.join('');
          const workbook = xlsx.read(bstr, { type: 'binary', cellDates: true });
          const first_sheet_name = workbook.SheetNames[0];
    
          const worksheet = workbook.Sheets[first_sheet_name];
          this.worksheet = xlsx.utils.sheet_to_json(worksheet, { raw: true });
    
          /**
           * Call matching function
           */
          this.matchingCell(this.worksheet, line);
        };
        fileReader.readAsArrayBuffer(file);
      }
       matchingCell(worksheet: any, line: any) {
           //ts-ignore
        let monTab= [];
     
        for (let i = 0; i < worksheet.length; i++) {
          const worksheetLine = worksheet[i];
          console.log(worksheet[i])
          const updatedLine = {
          
            nom: worksheet['NOM'],
            prenom: worksheet['PRENOM'],
            email: worksheet['EMAIL'],
            password: worksheet['PASSWORD']
          };
          line = {...line, ...updatedLine};
          monTab.push(line);
        }
       
      }
    
      //end import excel
    deleteUser(id: string) {
        const user = this.users.find(x => x.id === id);
        user.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.users = this.users.filter(x => x.id !== id) 
            });
    }
}