/* =====================================================
   AUDIT LOG MODULE
   Records Login, Logout, Create, Edit, Delete, Approve,
   Schedule, Complete, and Cancel events with user, date,
   time, module, and record reference.
===================================================== */
const Audit={
/** Write an immutable audit entry. */
async log(action,module,ref){const u=App?.currentUser?.username||'system';const now=new Date();await Storage.put('audit',{user:u,date:now.toISOString().slice(0,10),time:now.toLocaleTimeString(),action,module,ref});},
/** Render paginated audit history. */
async render(){const rows=(await Storage.all('audit')).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));App.renderTable('Audit Logs',rows,['date','time','user','action','module','ref'],null,'audit');}
};
