/* =====================================================
   INVENTORY & SPARE PARTS MODULE
   Tracks part numbers, quantities, suppliers, Nigerian
   Naira unit costs, low stock alerts, and stock usage.
===================================================== */
const Inventory={fields:['partNumber','name','quantity','minimum','supplier','unitCost'],
/** Use stock and record consumption in the item history. */
async use(id,qty){const rows=await Storage.all('inventory');const item=rows.find(x=>x.id===id);item.quantity=Number(item.quantity)-Number(qty||1);item.usage=item.usage||[];item.usage.push({date:new Date().toISOString(),qty});await Storage.put('inventory',item);await Audit.log('Edit','Inventory',item.partNumber);if(item.quantity<=item.minimum)await Notifications.create(item.quantity<=0?'Critical':'High',item.quantity<=0?'Out of Stock':'Low Stock',`${item.name} quantity is ${item.quantity}.`,'Inventory',item.partNumber);Inventory.render();},
/** Render spare parts inventory with stock controls. */
async render(editId){const rows=await Storage.all('inventory');const edit=rows.find(x=>x.id===editId)||{};document.getElementById('content').innerHTML=App.formHtml('Inventory Part',this.fields,edit)+`<div id="table-slot"></div>`;App.renderTable('Inventory & Spare Parts',rows,this.fields,async(id)=>{await Storage.remove('inventory',id);await Audit.log('Delete','Inventory',id);Inventory.render();},'inventory',true,(id)=>Inventory.render(id),async(row)=>`<button class="btn btn-small btn-ghost" onclick="Inventory.use('${row.id}',1)">Use 1</button>`);document.getElementById('entity-form').onsubmit=async e=>{e.preventDefault();await Storage.put('inventory',{...edit,...formData(e.target)});await Audit.log(edit.id?'Edit':'Create','Inventory',e.target.partNumber.value);Inventory.render();};}
};
