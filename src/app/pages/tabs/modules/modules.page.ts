import { IonModal } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { StudentModule, Activity } from 'src/app/Models/course';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.page.html',
  styleUrls: ['./modules.page.scss'],
})
export class ModulesPage implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('modal2', { static: true }) modal2!: IonModal;
  private db!: SQLiteObject;

  constructor(private sqlite: SQLite) { }

  ngOnInit() {
    // Open or create the SQLite database
    this.sqlite
      .create({
        name: 'your_database_name.db',
        location: 'default',
      })
      .then((db: SQLiteObject) => {
        this.db = db;

        // Initialize the database schema if needed
        this.createTables();

        // Load data from SQLite
        this.loadDataFromSQLite();
      })
      .catch((error) => console.error('Error opening database', error));
  }

  ionViewDidEnter() {
    this.loadDataFromSQLite();
    this.handleRefresh(event);
  }

  handleRefresh(event : any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  }

  token! : any;
  Modules : StudentModule [] = [];
  newModule : StudentModule = new StudentModule;
  selectedModule! : StudentModule;
  presentingElement : any;
  userID! : string;
  Activities : Activity [] = [];

  createTables() {
    // Create tables if they don't exist
    this.db
      .executeSql(
        'CREATE TABLE IF NOT EXISTS modules (moduleID INTEGER PRIMARY KEY AUTOINCREMENT, moduleName TEXT, userID TEXT)',
        []
      )
      .then(() => console.log('Table created successfully'))
      .catch((error) => console.error('Error creating table', error));
  }

  loadDataFromSQLite() {
    // Fetch data from SQLite and assign it to this.Modules
    this.db
      .executeSql('SELECT * FROM modules', [])
      .then((data) => {
        const modules: StudentModule[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          const module = data.rows.item(i);
          modules.push({
            moduleID: module.moduleID,
            moduleName: module.moduleName,
          });
        }
        this.Modules = modules;
      })
      .catch((error) => console.error('Error fetching data from SQLite', error));
  }

  // Modify AddModule, UpdateModule, and DeleteModule methods to insert, update, and delete data in SQLite
  AddModule(): void {
    if (this.newModule.moduleName.length < 1) {
      this.message = 'Module Name is required';
      this.setOpen(true);
    } else {
      const insertQuery = 'INSERT INTO modules (moduleName, userID) VALUES (?, ?)';
      const values = [this.newModule.moduleName, this.userID];

      this.db
        .executeSql(insertQuery, values)
        .then(() => {
          this.message = 'Module Added successfully';
          this.setOpen(true);
          this.loadDataFromSQLite();
          this.modal.dismiss();
          this.newModule = new StudentModule();
        })
        .catch((error) => {
          this.message = 'Error adding module';
          this.setOpen(true);
        });
    }
  }

  UpdateModule(): void {
    if (this.selectedModule.moduleName.length < 1) {
      this.message = 'Module Name is required';
      this.setOpen(true);
    } else {
      const updateQuery = 'UPDATE modules SET moduleName = ? WHERE moduleID = ?';
      const values = [this.selectedModule.moduleName, this.selectedModule.moduleID];

      this.db
        .executeSql(updateQuery, values)
        .then(() => {
          this.message = 'Module Updated successfully';
          this.setOpen(true);
          this.loadDataFromSQLite();
          this.modal2.dismiss();
          this.selectedModule = new StudentModule();
        })
        .catch((error) => {
          this.message = 'Error updating module';
          this.setOpen(true);
        });
    }
  }

  DeleteModule(): void {
    const deleteQuery = 'DELETE FROM modules WHERE moduleID = ?';
    const values = [this.selectedModule.moduleID];

    this.db
      .executeSql(deleteQuery, values)
      .then(() => {
        this.message = 'Module deleted successfully';
        this.setOpen(true);
        this.loadDataFromSQLite();
        this.modal2.dismiss();
        this.selectedModule = new StudentModule();
      })
      .catch((error) => {
        this.message = 'Error deleting module';
        this.setOpen(true);
      });
  }

  refreshPage(): void {
    window.location.reload();
  }

  message! : string;
  isToastOpen = false;
  top = 'top';
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  selectModule(moduleID : number)
  {
    var module = this.Modules.find(a=>a.moduleID==moduleID);
    if(module){
    this.selectedModule = module;
    this.modal2.present();
  }
  }
}
