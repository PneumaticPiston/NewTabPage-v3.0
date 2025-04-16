const defaultSettings={theme:"light",useCustomBackground:!1,backgroundURL:"",backgroundImage:null,showSearch:!0,showShortcuts:!0,searchEngine:"google",searchBarPosition:{x:10,y:120},fontSize:16,groupScale:100,spacingScale:100,highContrast:!1,customThemes:[],shortcuts:[{title:"Google",url:"https://www.google.com"},{title:"Youtube",url:"https://www.youtube.com"},{title:"Gmail",url:"https://mail.google.com"},{title:"Drive",url:"https://drive.google.com"},{title:"Maps",url:"https://maps.google.com"}],apps:[{name:"Account",icon:"https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_32dp.png",url:"https://myaccount.google.com/"},{name:"Search",icon:"https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png",url:"https://www.google.com/"},{name:"Maps",icon:"https://maps.gstatic.com/mapfiles/maps_lite/favicon_maps.ico",url:"https://maps.google.com/"},{name:"YouTube",icon:"https://www.youtube.com/s/desktop/1c3bfd26/img/favicon_32x32.png",url:"https://youtube.com/"},{name:"Play",icon:"https://www.gstatic.com/images/branding/product/1x/play_round_32dp.png",url:"https://play.google.com/"},{name:"Gmail",icon:"https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",url:"https://mail.google.com/"},{name:"Drive",icon:"https://ssl.gstatic.com/images/branding/product/1x/drive_32dp.png",url:"https://drive.google.com/"},{name:"Calendar",icon:"https://ssl.gstatic.com/calendar/images/favicon_v2021_32.ico",url:"https://calendar.google.com/"},{name:"Photos",icon:"https://ssl.gstatic.com/images/branding/product/1x/photos_32dp.png",url:"https://photos.google.com/"}]};let currentSettings={};const customBgInput=document.getElementById("custom-bg"),bgFileInput=document.getElementById("bg-file"),bgFileButton=document.getElementById("bg-file-button"),fileNameDisplay=document.getElementById("file-name"),bgPreviewImg=document.getElementById("bg-preview-img"),useCustomBgToggle=document.getElementById("use-custom-bg"),bgInputContainer=document.getElementById("bg-input-container"),showSearchToggle=document.getElementById("show-search"),showShortcutsToggle=document.getElementById("show-shortcuts")||{checked:!0},searchEngineSelect=document.getElementById("search-engine"),saveButton=document.getElementById("save-settings"),resetButton=document.getElementById("reset-settings"),resetNewtabButton=document.getElementById("reset-newtab"),themeGrid=document.getElementById("theme-grid"),fontSizeSlider=document.getElementById("font-size"),fontSizeValue=document.getElementById("font-size-value"),groupScaleSlider=document.getElementById("group-scale"),groupScaleValue=document.getElementById("group-scale-value"),spacingScaleSlider=document.getElementById("spacing-scale"),spacingScaleValue=document.getElementById("spacing-scale-value"),highContrastToggle=document.getElementById("high-contrast"),customThemeName=document.getElementById("custom-theme-name"),customPrimary=document.getElementById("custom-primary"),customSecondary=document.getElementById("custom-secondary"),customAccent=document.getElementById("custom-accent"),customText=document.getElementById("custom-text"),customBackground=document.getElementById("custom-background"),saveCustomThemeBtn=document.getElementById("save-custom-theme"),baseThemes=[{id:"light",name:"Light Minimal"},{id:"dark",name:"Modern Dark"},{id:"forest",name:"Forest"},{id:"ocean",name:"Ocean"},{id:"sunset",name:"Sunset"},{id:"cyber",name:"Cyberpunk"},{id:"midnight",name:"Midnight Blue"},{id:"emerald",name:"Emerald Dark"},{id:"slate",name:"Slate Blue"},{id:"deep",name:"Deep Purple"},{id:"nord",name:"Nord"},{id:"custom",name:"Custom Theme"}];function handleFileUpload(e){const t=e.target.files[0];if(!t)return;fileNameDisplay.textContent=t.name;const o=new FileReader;o.onload=function(e){const t=e.target.result;bgPreviewImg.src=t,bgPreviewImg.style.display="block",currentSettings.backgroundImage=t,customBgInput.value=""},o.readAsDataURL(t)}function updateBackgroundPreview(){const e=customBgInput.value.trim();e&&(bgPreviewImg.src=e,bgPreviewImg.style.display="block",currentSettings.backgroundURL=e,currentSettings.backgroundImage=null)}function toggleBackgroundInputs(){const e=useCustomBgToggle.checked;bgInputContainer.style.display=e?"block":"none",currentSettings.useCustomBackground=e}async function loadSettings(){try{if("undefined"!=typeof chrome&&chrome.storage){const e=await chrome.storage.sync.get(["settings"]);currentSettings=e.settings||{...defaultSettings};try{const e=await chrome.storage.local.get(["backgroundImage"]);e.backgroundImage&&(currentSettings.backgroundImage=e.backgroundImage,console.log("Background image loaded from Chrome local storage"))}catch(e){console.warn("Error loading background image from local storage:",e)}}else{const e=localStorage.getItem("settings");currentSettings=e?JSON.parse(e):{...defaultSettings};try{const e=localStorage.getItem("backgroundImage");e&&(currentSettings.backgroundImage=e)}catch(e){console.warn("Error loading background image from localStorage:",e)}}currentSettings.customThemes||(currentSettings.customThemes=[]),useCustomBgToggle.checked=!0===currentSettings.useCustomBackground,customBgInput.value=currentSettings.backgroundURL||"",showSearchToggle.checked=!1!==currentSettings.showSearch,showShortcutsToggle&&"checked"in showShortcutsToggle&&(showShortcutsToggle.checked=!1!==currentSettings.showShortcuts),searchEngineSelect.value=currentSettings.searchEngine||"google",currentSettings.backgroundImage?(bgPreviewImg.src=currentSettings.backgroundImage,bgPreviewImg.style.display="block"):currentSettings.backgroundURL?(bgPreviewImg.src=currentSettings.backgroundURL,bgPreviewImg.style.display="block"):bgPreviewImg.style.display="none",toggleBackgroundInputs(),fontSizeSlider.value=currentSettings.fontSize||16,updateFontSizeDisplay(),groupScaleSlider.value=currentSettings.groupScale||100,updateGroupScaleDisplay(),spacingScaleSlider.value=currentSettings.spacingScale||100,updateSpacingScaleDisplay(),highContrastToggle.checked=!0===currentSettings.highContrast,generateThemeGrid(),applyThemeToPage(currentSettings.theme||"light"),console.log("Settings loaded:",currentSettings)}catch(e){console.error("Error loading settings:",e),currentSettings={...defaultSettings},generateThemeGrid()}}async function saveSettings(){try{const e=document.querySelector(".theme-card.active"),t=e?e.dataset.themeId:"light",o=JSON.parse(JSON.stringify(currentSettings)),n={...o,theme:t,useCustomBackground:useCustomBgToggle.checked,backgroundURL:customBgInput.value,backgroundImage:currentSettings.backgroundImage||null,showSearch:showSearchToggle.checked,showShortcuts:showShortcutsToggle&&"checked"in showShortcutsToggle?showShortcutsToggle.checked:!1!==currentSettings.showShortcuts,searchEngine:searchEngineSelect.value,searchBarPosition:o.searchBarPosition||{x:10,y:120},fontSize:parseInt(fontSizeSlider.value)||16,groupScale:parseInt(groupScaleSlider.value)||100,spacingScale:parseInt(spacingScaleSlider.value)||100,highContrast:highContrastToggle.checked};n.customThemes||(n.customThemes=[]),n.headerLinks||(n.headerLinks=defaultSettings.headerLinks),n.apps||(n.apps=defaultSettings.apps),currentSettings=n;const s=currentSettings.backgroundImage,c={...currentSettings,backgroundImage:null};if("undefined"!=typeof chrome&&chrome.storage)try{await chrome.storage.sync.set({settings:c}),console.log("Settings saved to Chrome sync storage"),s?(await chrome.storage.local.set({backgroundImage:s}),console.log("Background image saved to Chrome local storage")):await chrome.storage.local.remove("backgroundImage")}catch(e){console.error("Error saving to Chrome storage:",e),localStorage.setItem("settings",JSON.stringify(c)),s?localStorage.setItem("backgroundImage",s):localStorage.removeItem("backgroundImage"),console.log("Settings saved to localStorage (fallback)")}else localStorage.setItem("settings",JSON.stringify(c)),s?localStorage.setItem("backgroundImage",s):localStorage.removeItem("backgroundImage"),console.log("Settings saved to localStorage");saveButton.textContent="Saved!",setTimeout((()=>{saveButton.textContent="Save Settings"}),2e3),window.location.reload()}catch(e){console.error("Error saving settings:",e),alert("Error saving settings. Please try again."),saveButton.textContent="Save Settings"}}function resetSettings(){currentSettings={...defaultSettings},useCustomBgToggle.checked=defaultSettings.useCustomBackground,customBgInput.value=defaultSettings.backgroundURL,currentSettings.backgroundImage=null,bgPreviewImg.style.display="none",bgPreviewImg.src="",fileNameDisplay.textContent="No file chosen",toggleBackgroundInputs(),showSearchToggle.checked=defaultSettings.showSearch,showShortcutsToggle&&"checked"in showShortcutsToggle&&(showShortcutsToggle.checked=defaultSettings.showShortcuts),searchEngineSelect.value=defaultSettings.searchEngine,fontSizeSlider.value=defaultSettings.fontSize,updateFontSizeDisplay(),groupScaleSlider.value=defaultSettings.groupScale,updateGroupScaleDisplay(),spacingScaleSlider.value=defaultSettings.spacingScale,updateSpacingScaleDisplay(),highContrastToggle.checked=defaultSettings.highContrast,currentSettings.customThemes=[],generateThemeGrid(),applyThemeToPage(defaultSettings.theme),console.log("Settings reset to defaults (not saved yet)")}async function resetNewTab(){if(confirm("This will remove all your link groups and reset the new tab page layout. Are you sure?"))try{const e=[{type:"grid",title:"",links:[{title:"Google",url:"https://www.google.com"},{title:"YouTube",url:"https://www.youtube.com"},{title:"Maps",url:"https://maps.google.com"},{title:"Gmail",url:"https://mail.google.com"},{title:"Drive",url:"https://drive.google.com"}],x:"50%",y:200,rows:1,columns:5}];currentSettings.searchBarPosition={x:"50%",y:120},"undefined"!=typeof chrome&&chrome.storage&&chrome.storage.sync?await chrome.storage.sync.set({groups:e,settings:currentSettings}):(localStorage.setItem("groups",JSON.stringify(e)),localStorage.setItem("settings",JSON.stringify(currentSettings))),resetNewtabButton.textContent="Reset Complete!",setTimeout((()=>{resetNewtabButton.textContent="Reset New Tab Page"}),2e3)}catch(e){console.error("Error resetting new tab page:",e),alert("Error resetting new tab page. Please try again.")}}function generateThemeGrid(){themeGrid.innerHTML="";const e=[...baseThemes,...currentSettings.customThemes||[]];document.querySelector(".custom-theme-section").style.display="none",e.forEach((e=>{const t=document.createElement("div");t.className="theme-card",t.dataset.themeId=e.id,e.id===currentSettings.theme&&(t.classList.add("active"),("custom"===e.id||e.id.startsWith("custom-"))&&(document.querySelector(".custom-theme-section").style.display="block"));const o=document.createElement("div");o.className="theme-pie";["primary","secondary","accent","text","background"].forEach(((t,n)=>{const s=document.createElement("div");s.className="pie-slice";const c=72*n%360;if(s.style.transform=`rotate(${c}deg)`,e.id.startsWith("custom-"))s.style.backgroundColor=e[t];else if("custom"===e.id){const e={primary:customPrimary.value,secondary:customSecondary.value,accent:customAccent.value,text:customText.value,background:customBackground.value};s.style.backgroundColor=e[t]}else s.style.backgroundColor=`var(--${e.id}-${t})`;o.appendChild(s)}));const n=document.createElement("div");n.className="theme-name",n.textContent=e.name,t.addEventListener("click",(()=>{document.querySelectorAll(".theme-card").forEach((e=>e.classList.remove("active"))),t.classList.add("active"),"custom"===e.id||e.id.startsWith("custom-")?document.querySelector(".custom-theme-section").style.display="block":document.querySelector(".custom-theme-section").style.display="none",applyThemeToPage(e.id)})),t.appendChild(o),t.appendChild(n),themeGrid.appendChild(t)}))}function saveCustomTheme(){const e=customThemeName.value.trim()||"Custom Theme",t={id:"custom-"+Date.now(),name:e,primary:customPrimary.value,secondary:customSecondary.value,accent:customAccent.value,text:customText.value,background:customBackground.value};currentSettings.customThemes||(currentSettings.customThemes=[]),currentSettings.customThemes.push(t),generateThemeGrid(),customThemeName.value="",saveCustomThemeBtn.textContent="Theme Added!",setTimeout((()=>{saveCustomThemeBtn.textContent="Save Custom Theme"}),2e3)}function isColorDark(e){let t,o,n;if(e.startsWith("#")){let s=e.substring(1);3===s.length?(t=parseInt(s.charAt(0)+s.charAt(0),16),o=parseInt(s.charAt(1)+s.charAt(1),16),n=parseInt(s.charAt(2)+s.charAt(2),16)):(t=parseInt(s.substring(0,2),16),o=parseInt(s.substring(2,4),16),n=parseInt(s.substring(4,6),16))}else{if(!e.startsWith("rgb"))return!1;{const s=e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);if(!s)return!1;t=parseInt(s[1]),o=parseInt(s[2]),n=parseInt(s[3])}}return(299*t+587*o+114*n)/1e3<128}function applyThemeToPage(e){const t=e.startsWith("custom-");let o={};if(t){const t=currentSettings.customThemes.find((t=>t.id===e));t&&(o={primary:t.primary,secondary:t.secondary,accent:t.accent,text:t.text,background:t.background})}if(t){document.documentElement.style.setProperty("--primary-color",o.primary),document.documentElement.style.setProperty("--secondary-color",o.secondary),document.documentElement.style.setProperty("--accent-color",o.accent),document.documentElement.style.setProperty("--text-color",o.text),document.documentElement.style.setProperty("--background-color",o.background);const e=isColorDark(o.primary);document.documentElement.style.setProperty("--contrast-text-color",e?"#ffffff":"#000000")}else{document.documentElement.style.setProperty("--primary-color",`var(--${e}-primary)`),document.documentElement.style.setProperty("--secondary-color",`var(--${e}-secondary)`),document.documentElement.style.setProperty("--accent-color",`var(--${e}-accent)`),document.documentElement.style.setProperty("--text-color",`var(--${e}-text)`),document.documentElement.style.setProperty("--background-color",`var(--${e}-background)`);let t=!1;"dark"!==e&&"midnight"!==e&&"emerald"!==e&&"slate"!==e&&"deep"!==e&&"nord"!==e&&"cyber"!==e||(t=!0),document.documentElement.style.setProperty("--contrast-text-color",t?"#ffffff":"#000000")}document.body.style.backgroundColor=getComputedStyle(document.documentElement).getPropertyValue("--background-color"),currentSettings.useCustomBackground?currentSettings.backgroundImage?document.documentElement.style.setProperty("--background-image",`url(${currentSettings.backgroundImage})`):currentSettings.backgroundURL&&document.documentElement.style.setProperty("--background-image",`url(${currentSettings.backgroundURL})`):document.documentElement.style.setProperty("--background-image","none"),currentSettings.highContrast&&(document.documentElement.style.setProperty("--text-color","#000000"),document.documentElement.style.setProperty("--accent-color","#FF0000")),document.body.className="",document.body.classList.add(`theme-${e.split("-")[0]}`)}function updateFontSizeDisplay(){const e=fontSizeSlider.value;fontSizeValue.textContent=`${e}px`,document.documentElement.style.setProperty("--base-font-size",`${e}px`),document.documentElement.style.setProperty("--text-scale",e/16),document.documentElement.style.fontSize=`${e}px`}function updateGroupScaleDisplay(){const e=groupScaleSlider.value;groupScaleValue.textContent=`${e}%`,document.documentElement.style.setProperty("--group-scale",e/100),document.documentElement.style.setProperty("--element-scale",e/100)}function updateSpacingScaleDisplay(){const e=spacingScaleSlider.value;spacingScaleValue.textContent=`${e}%`,document.documentElement.style.setProperty("--spacing-scale",e/100),document.documentElement.style.setProperty("--spacing-multiplier",e/100)}document.addEventListener("DOMContentLoaded",loadSettings),saveButton.addEventListener("click",saveSettings),resetButton.addEventListener("click",resetSettings),resetNewtabButton.addEventListener("click",resetNewTab),useCustomBgToggle.addEventListener("change",toggleBackgroundInputs),bgFileButton.addEventListener("click",(()=>bgFileInput.click())),bgFileInput.addEventListener("change",handleFileUpload),customBgInput.addEventListener("input",updateBackgroundPreview),fontSizeSlider.addEventListener("input",updateFontSizeDisplay),groupScaleSlider.addEventListener("input",updateGroupScaleDisplay),spacingScaleSlider.addEventListener("input",updateSpacingScaleDisplay),saveCustomThemeBtn.addEventListener("click",saveCustomTheme),customPrimary.value="#457b9d",customSecondary.value="#a8dadc",customAccent.value="#e63946",customText.value="#1d3557",customBackground.value="#f1faee";