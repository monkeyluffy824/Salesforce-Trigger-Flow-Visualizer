document.addEventListener("DOMContentLoaded", () => {
  mermaid.initialize({
    startOnLoad: false, // We’ll control when to render
    theme: 'default'
});
  document.getElementById("connectToOrgViaBackend").addEventListener("click", async () => {
	     if(!salesforceDomain){
			 alert("No Active salesforce login found, please login to your org.");
		 }else{
			 salesforceDomain=salesforceDomain.replace("lightning.force.com","my.salesforce.com");
		 console.log(salesforceDomain);
		 chrome.cookies.getAll({ name: "sid", domain: salesforceDomain}, async (cookies) => {
		const sidCookie = cookies.find(c => c.domain.includes("my.salesforce.com"));
		if (!sidCookie) {
		  return;
		}

		const sid = sidCookie.value;
		const instanceUrl = `https://${sidCookie.domain.replace(/^\./, "")}`;
		finalURL=instanceUrl;
		finalSid= sid;
		try {
		  const res = await fetch(`${instanceUrl}/services/data/v64.0/sobjects/`, {
			headers: {
			  "Authorization": "Bearer " + sid,
			  "Content-Type": "application/json"
			}
		  });
		  const body = await res.json();
		  let sObjects=  body["sobjects"];
		  let objects=[];
		  let dummyMap= new Map();
		  for(const ind in sObjects){
			  let ent= sObjects[ind];
			  if(ent.triggerable){
				 
				 dummyMap.set(ent.label, ent.name);
				 objects.push(ent.label);
			  }
			  
			  
		  }
		  objectsList=objects;
		  objNameMap= dummyMap;
		  console.log(objNameMap);
		  
		  let container = document.querySelector('.alert-toast');
		  let alertSuccess = container.querySelector(`sl-alert[variant="success"]`);
		  let alertError = container.querySelector(`sl-alert[variant="warning"]`);
		  if(objectsList.length>0){
			  const menuCheck= document.getElementById("sObjectSelection");
			  if(menuCheck){
				  menuCheck.innerHTML='';
			  }
			  displaySObjects();
			  alertSuccess.toast();
			  
		  }else{
			  alertError.toast();
		  }
		  
		} catch (e) {
		  console.log('error occured', e);
		}
	  });
		 }
	     
  });
  
  document.getElementById("urlMenu").addEventListener("sl-change", (event)=>{
	  const selectedVal= event.target.value;
	  console.log(selectedVal,"from menu");
	  const tab= selectedVal;
	  if(tab){
		    const ur = new URL(tab);
		    salesforceDomain= ur.hostname;
			console.log(salesforceDomain);
			const  buttonElement= document.getElementById('connectToOrgViaBackend');
			buttonElement.disabled=false;
	   }
  });
  
});

let salesforceDomain='';
let objectsList=undefined;
let displayList = undefined;
let selectedSObject=undefined;
let finalURL=undefined;
let finalSid= undefined;
let objNameMap= undefined;
let detailsSObject= undefined;
let labelMap=new Map([['label','Label'],['name','Name'],['isCustom','Is Custom'],['isCreatable','Is Creatable'],['isCustomSettingObj','Is Custom Setting Object'],['totalFields','Total Fields'],
['totalChildRelations','Total ChildRelationships'],['isDeletable','Is Deletable'],['isSearchable','Is Searchable'],['totalRecordtypes','Total Record Types'],['isQueryable','Is Queryable'],['totalQuickActions','Total Quick Actions'],['totalListviews','Total Listviews']]);
let insertSObject= undefined;
let updateSobject= undefined;
let deleteSObject= undefined;
let undeleteSObject= undefined;

async function getSalesforceSessionDetails(){
	let queryOptions={
		lastFocusedWindow: true,
		url: ["https://*.salesforce.com/*","https://*.force.com/*"]
		
	};
	await chrome.tabs.query(queryOptions,(tabs)=>{
		const  buttonElement= document.getElementById('connectToOrgViaBackend');
		buttonElement.disabled=true;
		console.log(tabs);
		if(tabs.length>0){
			const urlMenu= document.getElementById('urlMenu');
			for(let k in tabs){
				const opt = document.createElement('sl-option');
				opt.value= tabs[k].url;
				opt.textContent = tabs[k].url;
				urlMenu.appendChild(opt);
			}
			
		}else{
			console.log("NO salesforce login found");
		}
	});
}


getSalesforceSessionDetails();


function displaySObjects(){
	if(objectsList){
		const displaySection= document.getElementById("sObjectSelection");
		const searchControlsDiv = document.createElement("div");
		const searchInput = document.createElement('sl-input');
		const heading = document.createElement('h3');
		heading.textContent="SObjectList:";
		displaySection.appendChild(heading);
		searchInput.placeholder="Type Object Label and press ENTER";
		searchInput.size="medium";
		searchInput.type="text"
		searchInput.id="SerachSObjects";
		searchInput.addEventListener("sl-change", (event)=>{
			console.log('serach bar value', event.target.value);
			let searchInput=event.target.value;
			displayList=objectsList.filter(item=>{
				if(item.toLowerCase().includes(searchInput.toLowerCase())){
					return item;
				}
			});
			const menu= document.getElementById('SObjectMenuTable');
			creationOfMenuItems(menu);
			
		});
		searchControlsDiv.appendChild(searchInput);
		displaySection.appendChild(searchControlsDiv);
		displayList=objectsList;
		const menu= document.createElement("sl-menu");
		menu.classList.add("table");
		menu.id="SObjectMenuTable";
		creationOfMenuItems(menu);
		console.log(menu);
		displaySection.appendChild(menu);
	}
}


function creationOfMenuItems(menuElement){
	menuElement.replaceChildren();
	for( let k in displayList){
		const menuItem= document.createElement('sl-menu-item');
		menuItem.textContent=displayList[k];
		menuItem.value=displayList[k];
		menuItem.label=displayList[k];
		menuElement.appendChild(menuItem);
	}
	
	menuElement.addEventListener('sl-select',(event)=>{
		selectedSObject=event.detail.item.label;
		const sObjectWindow= document.getElementById("sObjectSelection");
		const detailsWindowCheck= document.getElementById('detailsWindow');
		if(detailsWindowCheck){
			detailsWindowCheck.innerHTML='';
			addingDetailsWindow(detailsWindowCheck);
			
		}else{
			const detailsWindow= document.createElement('div');
			detailsWindow.id='detailsWindow';
			sObjectWindow.appendChild(addingDetailsWindow(detailsWindow));
		}
		console.log(selectedSObject);
	});
	
	
}

function addingDetailsWindow(detailsWindow){
			detailsWindow.classList.add('projects');
			const prefilledInput= document.createElement('sl-input');
			prefilledInput.placeholder=selectedSObject;
			prefilledInput.disabled=true;
			detailsWindow.appendChild(prefilledInput);
			const getDetailsButton= document.createElement('sl-button');
			getDetailsButton.size="medium";
			getDetailsButton.pill= true;
			getDetailsButton.variant="primary";
			getDetailsButton.textContent="Get Details";
			getDetailsButton.addEventListener("click",async ()=>{
				const nameOfObject=objNameMap.get(selectedSObject);
				if(! nameOfObject){
					return ;
				}
				let instanceUrl=finalURL;
				let sid= finalSid
				try {
					  const res = await fetch(`${instanceUrl}/services/data/v64.0/sobjects/${nameOfObject}/describe`, {
						headers: {
						  "Authorization": "Bearer " + sid,
						  "Content-Type": "application/json"
						}
					  });
					  const body = await res.json();
					  detailsSObject =await createDetailsJSON(body);
					  const detailsWindow= document.getElementById('detailsWindow');
					  const tablediv = document.getElementById('detailsTable');
					  if(tablediv){
						  tablediv.innerHTML='';
						  createTable(tablediv);
					  }else{
						  const createDiv = document.createElement('div');
						  createDiv.id='detailsTable';
						  createDiv.classList.add('dettab');
						  createTable(createDiv);
						  detailsWindow.appendChild(createDiv);
						  
						  
					  }
					  const buttonsDiv= document.createElement('div');
					  buttonsDiv.id="buttonsWindow";
					  buttonsDiv.classList.add('bwindow');
					  const getTriggerDetailsButton= document.createElement('sl-button');
						getTriggerDetailsButton.size="medium";
						getTriggerDetailsButton.pill= true;
						getTriggerDetailsButton.variant="primary";
						getTriggerDetailsButton.textContent="Get Trigger Details";
						buttonsDiv.appendChild(getTriggerDetailsButton);
						getTriggerDetailsButton.addEventListener('click',async ()=>{
							let query=`SELECT Name,Status,UsageBeforeInsert,UsageAfterInsert,UsageAfterDelete,UsageAfterUndelete,UsageAfterUpdate,UsageBeforeDelete,TableEnumOrId,UsageBeforeUpdate,UsageIsBulk,IsValid FROM ApexTrigger where TableEnumOrId ='${nameOfObject}'`;
							const triggerDetails=await toolingQuery(query);
							let records= triggerDetails.records;
							let insertDetails={before:[],after:[]};
							let updateDetails={before:[],after:[]};
							let deleteDetails={before:[],after:[]};
							let undeleteDetails={after:[]};
							for(let tri of records){
								if(tri.UsageBeforeInsert){
									if(!insertDetails.before.includes(tri.Name)){
										insertDetails.before.push(tri.Name);
									}
								}
								if(tri.UsageAfterInsert){
									if(!insertDetails.after.includes(tri.Name)){
										insertDetails.after.push(tri.Name);
									}
								}
								if(tri.UsageBeforeUpdate){
									if(!updateDetails.before.includes(tri.Name)){
										updateDetails.before.push(tri.Name);
									}
								}
								if(tri.UsageAfterUpdate){
									if(!updateDetails.after.includes(tri.Name)){
										updateDetails.after.push(tri.Name);
									}
								}
								if(tri.UsageBeforeDelete){
									if(!deleteDetails.before.includes(tri.Name)){
										deleteDetails.before.push(tri.Name);
									}
								}
								if(tri.UsageAfterDelete){
									if(!deleteDetails.after.includes(tri.Name)){
										deleteDetails.after.push(tri.Name);
									}
								}
								if(tri.UsageAfterUndelete){
									if(!undeleteDetails.after.includes(tri.Name)){
										undeleteDetails.after.push(tri.Name);
									}
								}
							}
							insertSObject=insertDetails;
							updateSobject=updateDetails;
							deleteSObject=deleteDetails;
							undeleteSObject=undeleteDetails;
							let buttonsList=['Insert','Update','Delete','undelete'];
							let CRUDButtons= document.getElementById('CRUDButtons');
							if(CRUDButtons){
								CRUDButtons.innerHTML='';
							}else{
								let createCRUD= document.createElement('div');
								createCRUD.id='CRUDButtons';
								createCRUD.classList.add('bwindow');
								CRUDButtons=createCRUD;
								
							}
							buttonsDiv.appendChild(CRUDButtons);
							for(let b of buttonsList){
								const button= document.createElement('sl-button');
								button.size="medium";
								button.pill= true;
								button.variant="default";
								button.textContent=`Visualize ${b}`;
								CRUDButtons.appendChild(button);
								button.addEventListener('click', ()=>{
									let diag= drawMermaid(b);
									console.log(diag);
									const detailsWindow= document.getElementById('detailsWindow');
									const mermaidDivDummy= document.getElementById('mermaidDiagram');
									if(mermaidDivDummy){
										mermaidDivDummy.innerHTML='';
										
									}else{
										const mermaidDiv= document.createElement('div');
										mermaidDiv.id='mermaidDiagram';
										detailsWindow.appendChild(mermaidDiv);
									}
									renderMermaidDiagram(diag);
								});
							}
						});
						
						detailsWindow.appendChild(buttonsDiv);
				}catch (e) {
					console.log('error occured', e);
				}
			});
			detailsWindow.appendChild(getDetailsButton);
			
			return detailsWindow;
}



async function createDetailsJSON(body){
	let dummyDetails={};
	dummyDetails.label=body.label;
	dummyDetails.name=body.name;
	dummyDetails.isCustom=body.custom;
	dummyDetails.isCreatable=body.createable;
	dummyDetails.isCustomSettingObj=body.customSetting;
	dummyDetails.totalFields=body.fields.length;
	dummyDetails.totalChildRelations= body.childRelationships.length;
	dummyDetails.isDeletable=body.deletable;
	dummyDetails.isSearchable=body.searchable;
	dummyDetails.totalRecordtypes= body.recordTypeInfos.length;
	dummyDetails.isQueryable=body.queryable;
	let instanceUrl=finalURL;
	let sid= finalSid;
	try {
		
			if(body.urls.listviews){
				const listRes = await fetch(`${instanceUrl}${body.urls.listviews}`, {
						headers: {
						  "Authorization": "Bearer " + sid,
						  "Content-Type": "application/json"
						}
					  });
					  const listBody = await listRes.json();
					  dummyDetails.totalListviews=listBody.size;
			}
			if(body.urls.quickActions){
				const quickRes = await fetch(`${instanceUrl}${body.urls.quickActions}`, {
						headers: {
						  "Authorization": "Bearer " + sid,
						  "Content-Type": "application/json"
						}
					  });
					  const quickBody = await quickRes.json();
					  dummyDetails.totalQuickActions=quickBody.length;
			}  
	}catch (e) {
		console.log('error occured', e);
    }
	
	return dummyDetails;
}

function createTable(divTable){
	const table= document.createElement('table');
	table.classList.add('table');
	const tableBody= document.createElement('tbody');
	for(let k in detailsSObject){
		const row= document.createElement('tr');
		row.classList.add('td');
		row.classList.add('protable');
		const td1= document.createElement('td');
		td1.textContent=labelMap.get(k);
		const td2= document.createElement('td');
		td2.textContent=detailsSObject[k];
		row.appendChild(td1);
		row.appendChild(td2);
		tableBody.appendChild(row);
	}
	table.appendChild(tableBody);
	divTable.appendChild(table);
}

async function toolingQuery(query){
	let encodingURL= encodeURIComponent(query);
	const url=`${finalURL}/services/data/v64.0/tooling/query/?q=${encodingURL}`;
	try{
		const queryRes= await fetch(url,{
			headers: {
			  "Authorization": "Bearer " + finalSid,
			  "Content-Type": "application/json"
			}
		  });
		  const body= await queryRes.json();
		  console.log(JSON.stringify(body));
		  return body;
	}catch(e){
		console.log(e);
	}
	
}

function drawMermaid(typ){
	let obj=undefined;
	if(typ==='Insert'){
		obj=insertSObject;
	}else if(typ==='Update'){
		obj=updateSobject;
	}else if(typ==='Delete'){
		obj=deleteSObject;
	}else{
		obj=undeleteSObject;
	}
	let diagram='';
	diagram = `journey\n    title ${selectedSObject} ${typ.toUpperCase()} Execution Flow\n`;
    diagram+= `    section Before\n      [Validation Rules] : 4\n`;
  if (obj.before && obj.before.length > 0) {
    obj.before.forEach(step => {
      diagram += `      [Trigger] ${step} : 5\n`;
    });
  }
  diagram += `    section After\n`;
  
  if (obj.after && obj.after.length > 0) {
    
    obj.after.forEach(step => {
      diagram += `      [Trigger] ${step} : 5\n`;
    });
  }
  
  diagram+= `      [Assignment Rules] :4 \n`;

  return diagram;
	
}


function renderMermaidDiagram(diagramDefinition) {
    const mermaidContainer = document.getElementById('mermaidDiagram');
	mermaidContainer.innerHTML = '';
	const newDiagramDiv = document.createElement('div');
    newDiagramDiv.className = 'mermaid';
    newDiagramDiv.textContent = diagramDefinition;
	mermaidContainer.appendChild(newDiagramDiv);
	console.log(mermaidContainer);
    mermaid.init(undefined, newDiagramDiv);
}
