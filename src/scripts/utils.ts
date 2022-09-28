export class SaveLoadManager{
    openFile(){}
    saveFile(){}
    exportAsExcel(){}
    
}
export function unFocus (event) {
    console.log('bluring button')
    event.target.blur();
      event.target.parentNode.blur();
  }