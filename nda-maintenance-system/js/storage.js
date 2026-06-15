/* =====================================================
   OFFLINE STORAGE MODULE
   Handles IndexedDB persistence with localStorage fallback,
   seeded NDA demo records, and generic CRUD helpers for
   high-volume vehicle, maintenance, servicing, inventory,
   notification, user, and audit collections.
===================================================== */
const NDAStores=['vehicles','maintenance','servicing','inventory','notifications','users','audit'];
const Storage={db:null,dbName:'ndaFleetMaintenanceDB',version:1,
/** Open IndexedDB and create object stores. */
async init(){return new Promise((resolve)=>{if(!('indexedDB'in window)){resolve(null);return}const req=indexedDB.open(this.dbName,this.version);req.onupgradeneeded=e=>{const db=e.target.result;NDAStores.forEach(s=>{if(!db.objectStoreNames.contains(s)){db.createObjectStore(s,{keyPath:'id'});}})};req.onsuccess=e=>{this.db=e.target.result;resolve(this.db)};req.onerror=()=>resolve(null);});},
/** Return a transaction object store. */
store(name,mode='readonly'){return this.db.transaction(name,mode).objectStore(name)},
/** Get every record from a store. */
async all(name){if(!this.db)return JSON.parse(localStorage.getItem(name)||'[]');return new Promise((res,rej)=>{const r=this.store(name).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});},
/** Save a record to a store. */
async put(name,record){record.updatedAt=new Date().toISOString();if(!record.id)record.id=crypto.randomUUID();if(!this.db){const a=await this.all(name);const i=a.findIndex(x=>x.id===record.id);i>=0?a[i]=record:a.push(record);localStorage.setItem(name,JSON.stringify(a));return record}return new Promise((res,rej)=>{const r=this.store(name,'readwrite').put(record);r.onsuccess=()=>res(record);r.onerror=()=>rej(r.error);});},
/** Delete a record by ID. */
async remove(name,id){if(!this.db){localStorage.setItem(name,JSON.stringify((await this.all(name)).filter(x=>x.id!==id)));return}return new Promise((res,rej)=>{const r=this.store(name,'readwrite').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});},
/** Seed operational records so the system is usable immediately offline. */
async seed(){if((await this.all('users')).length)return;await Users.create({username:'admin',name:'NDA Administrator',role:'Administrator',password:'admin123'});const today=new Date();const iso=d=>new Date(d).toISOString().slice(0,10);for(let i=1;i<=12;i++){await this.put('vehicles',{vehicleId:`NDA-VH-${String(i).padStart(4,'0')}`,registration:`NDA-${1000+i}`,chassis:`CHS-NDA-${i}`,engine:`ENG-NDA-${i}`,type:i%3?'Utility Truck':'Armoured Support',manufacturer:i%2?'Toyota':'Innoson',model:i%2?'Hilux':'IVM G80',unit:'Logistics Wing',purchaseDate:'2022-01-15',mileage:24000+i*850,lastServiceDate:iso(today-55*864e5),nextServiceDate:iso(today+(i-6)*5*864e5),lastServiceMileage:22000,nextServiceMileage:30000,status:i%5===0?'Maintenance':'Active'});}const statuses=['Pending','Approved','Scheduled','In Progress','Awaiting Parts','Awaiting Inspection','Completed','Overdue'];for(let i=1;i<=18;i++){await this.put('maintenance',{jobNumber:`JOB-${Date.now().toString().slice(-5)}-${i}`,vehicle:`NDA-VH-${String((i%12)+1).padStart(4,'0')}`,title:i%2?'Routine service':'Brake inspection',type:i%3?'Routine Servicing':'Inspection',priority:['Critical','High','Medium','Low'][i%4],workshop:'NDA Central Workshop',technician:'Tech Officer '+i,dateCreated:iso(today-i*864e5),scheduledDate:iso(today+(i-9)*864e5),completionDate:i%7===0?iso(today-i*864e5):'',estimatedCost:50000+i*7500,actualCost:i%7===0?56000+i*7000:0,notes:'Seeded maintenance operation record.',status:statuses[i%statuses.length]});}for(let i=1;i<=10;i++)await this.put('inventory',{partNumber:`PRT-${i}`,name:['Oil Filter','Brake Pad','Battery','Tyre','Spark Plug'][i%5],quantity:i*3,minimum:10,supplier:'NDA Approved Supplier',unitCost:15000+i*2500,usage:[]});}
};
/** Format Nigerian Naira amounts consistently. */
function naira(v){return '₦'+Number(v||0).toLocaleString('en-NG');}
/** Escape HTML to keep locally stored data safe in the UI. */
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
/** Convert form fields into a plain object. */
function formData(form){return Object.fromEntries(new FormData(form).entries());}
