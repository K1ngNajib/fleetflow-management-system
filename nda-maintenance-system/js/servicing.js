/* =====================================================
   SERVICING MANAGEMENT MODULE
   Tracks routine servicing, oil changes, tires, brakes,
   engine, transmission, battery, and inspections while
   calculating days/mileage until due and overdue values.
===================================================== */
const ServiceTypes=['Routine Servicing','Oil Change','Tire Replacement','Brake Servicing','Engine Servicing','Transmission Servicing','Battery Replacement','Inspection Activity'];
const Servicing={fields:['vehicle','serviceType','lastServiceDate','nextServiceDate','currentMileage','nextServiceMileage','workshop','notes'],
/** Calculate due and overdue service metrics. */
metrics(r){const days=Math.ceil((new Date(r.nextServiceDate)-new Date())/864e5);const km=Number(r.nextServiceMileage)-Number(r.currentMileage);return {...r,daysUntilService:Math.max(days,0),mileageUntilService:Math.max(km,0),daysOverdue:Math.max(-days,0),mileageOverdue:Math.max(-km,0)};},
/** Render servicing schedule and calculated readiness columns. */
async render(editId){let rows=(await Storage.all('servicing')).map(this.metrics);const edit=(await Storage.all('servicing')).find(x=>x.id===editId)||{};document.getElementById('content').innerHTML=App.formHtml('Servicing Schedule',this.fields,edit,{serviceType:ServiceTypes})+`<div id="table-slot"></div>`;App.renderTable('Servicing Schedule',rows,[...this.fields,'daysUntilService','mileageUntilService','daysOverdue','mileageOverdue'],async(id)=>{await Storage.remove('servicing',id);await Audit.log('Delete','Servicing',id);Servicing.render();},'servicing',true,(id)=>Servicing.render(id));document.getElementById('entity-form').onsubmit=async e=>{e.preventDefault();await Storage.put('servicing',{...edit,...formData(e.target)});await Audit.log(edit.id?'Edit':'Create','Servicing',e.target.vehicle.value);Servicing.render();};}
};
