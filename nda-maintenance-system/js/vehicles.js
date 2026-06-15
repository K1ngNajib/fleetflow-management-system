/* =====================================================
   VEHICLE MANAGEMENT MODULE
   Handles vehicle identity, registration, service schedule,
   mileage, unit assignment, status, searching, filtering,
   sorting, editing, and deletion.
===================================================== */
const VehicleStatuses=['Active','Maintenance','Reserved','Retired','Out of Service'];
const Vehicles={fields:['vehicleId','registration','chassis','engine','type','manufacturer','model','unit','purchaseDate','mileage','lastServiceDate','nextServiceDate','lastServiceMileage','nextServiceMileage','status'],
/** Render the vehicle form and paginated table. */
async render(editId){const rows=await Storage.all('vehicles');const edit=rows.find(x=>x.id===editId)||{};document.getElementById('content').innerHTML=App.formHtml('Vehicle',this.fields,edit,{status:VehicleStatuses})+`<div id="table-slot"></div>`;App.renderTable('Vehicle Register',rows,this.fields,async(id)=>{await Storage.remove('vehicles',id);await Audit.log('Delete','Vehicles',id);Vehicles.render();},'vehicles',true,(id)=>Vehicles.render(id));document.getElementById('entity-form').onsubmit=async e=>{e.preventDefault();const data={...edit,...formData(e.target)};await Storage.put('vehicles',data);await Audit.log(edit.id?'Edit':'Create','Vehicles',data.vehicleId);await Notifications.create('Low',edit.id?'Vehicle Updated':'Vehicle Created',`${data.vehicleId} record saved.`,'Vehicles',data.vehicleId);Vehicles.render();};}
};
