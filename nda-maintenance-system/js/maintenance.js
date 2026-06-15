/* =====================================================
   MAINTENANCE MANAGEMENT MODULE
   Handles Maintenance Job Creation, Job Updates,
   Scheduling, Notifications, Costs, Approval, Completion,
   and Reporting for filled, pending, active, overdue,
   and completed jobs.
===================================================== */
const JobStatuses=['Pending','Approved','Scheduled','In Progress','Awaiting Parts','Awaiting Inspection','Completed','Overdue','Cancelled'];
const Priorities=['Critical','High','Medium','Low'];
const Maintenance={fields:['jobNumber','vehicle','title','type','priority','workshop','technician','dateCreated','scheduledDate','completionDate','estimatedCost','actualCost','notes','status'],
/** Create or update a maintenance job. */
async save(data,edit={}){if(!data.jobNumber)data.jobNumber='JOB-'+Date.now();if(!data.dateCreated)data.dateCreated=new Date().toISOString().slice(0,10);await Storage.put('maintenance',{...edit,...data});await Audit.log(edit.id?'Edit':'Create','Maintenance',data.jobNumber);await Notifications.create(data.priority||'Medium',`Job ${edit.id?'Updated':'Created'}`,`${data.jobNumber} is ${data.status}.`,'Maintenance',data.jobNumber);},
/** Render job command table with workflow actions. */
async render(editId){const rows=await Storage.all('maintenance');const edit=rows.find(x=>x.id===editId)||{};document.getElementById('content').innerHTML=App.formHtml('Maintenance Job',this.fields,edit,{priority:Priorities,status:JobStatuses})+`<div id="table-slot"></div>`;App.renderTable('Maintenance Jobs',rows,this.fields,async(id)=>{await Storage.remove('maintenance',id);await Audit.log('Delete','Maintenance',id);Maintenance.render();},'maintenance',true,(id)=>Maintenance.render(id),async(row)=>`<select onchange="Maintenance.setStatus('${row.id}',this.value)">${JobStatuses.map(s=>`<option ${s===row.status?'selected':''}>${s}</option>`).join('')}</select>`);document.getElementById('entity-form').onsubmit=async e=>{e.preventDefault();await Maintenance.save(formData(e.target),edit);Maintenance.render();};},
/** Update job status and issue workflow notification. */
async setStatus(id,status){const rows=await Storage.all('maintenance');const row=rows.find(r=>r.id===id);row.status=status;if(status==='Completed'&&!row.completionDate)row.completionDate=new Date().toISOString().slice(0,10);await Storage.put('maintenance',row);await Audit.log(status,'Maintenance',row.jobNumber);await Notifications.create(status==='Completed'?'Low':'Medium','Maintenance Update',`${row.jobNumber}: ${status}`,'Maintenance',row.jobNumber);Maintenance.render();}
};
