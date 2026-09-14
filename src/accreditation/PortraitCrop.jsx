import {useEffect,useRef,useState} from 'react';

export function PortraitCrop({onChange}){
  const canvas=useRef(null),[image,setImage]=useState(null),[error,setError]=useState('');
  const [crop,setCrop]=useState({zoom:1,x:50,y:30});
  useEffect(()=>{
    onChange('');
    if(!image||!canvas.current)return;
    const context=canvas.current.getContext('2d');
    const ratio=Math.max(600/image.width,800/image.height)*crop.zoom;
    const w=600/ratio,h=800/ratio;
    context.drawImage(image,(image.width-w)*crop.x/100,(image.height-h)*crop.y/100,w,h,0,0,600,800);
    onChange(canvas.current.toDataURL('image/jpeg',0.92).split(',')[1]);
  },[image,crop,onChange]);
  async function select(event){
    const file=event.target.files[0];setError('');setImage(null);onChange('');
    if(!file)return;
    if(file.size>2*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){
      setError('Choose a JPG, PNG or WebP portrait below 2 MB.');event.target.value='';return;
    }
    const url=URL.createObjectURL(file),picture=new Image();
    try{picture.src=url;await picture.decode();if(picture.width<120||picture.height<120)throw Error();setCrop({zoom:1,x:50,y:30});setImage(picture);}
    catch{setError('The photograph could not be opened. Choose another clear portrait.');event.target.value='';}
    finally{URL.revokeObjectURL(url);}
  }
  return <div className="portrait-editor">
    <div><label>Recent portrait photograph<input type="file" name="headshot" accept="image/jpeg,image/png,image/webp" required onChange={select}/></label>
      <p className="ops-caption">Face visible, no filters. JPG, PNG or WebP · up to 2 MB.</p>
      {error&&<p role="alert" className="ops-error">{error}</p>}
      {image&&<fieldset><legend>Adjust the crop</legend>
        {[['zoom','Zoom',1,2.5,0.05],['x','Horizontal position',0,100,1],['y','Vertical position',0,100,1]].map(([key,label,min,max,step])=><label key={key}>{label}<input type="range" min={min} max={max} step={step} value={crop[key]} onChange={e=>setCrop(c=>({...c,[key]:Number(e.target.value)}))}/></label>)}
        <button type="button" onClick={()=>setCrop({zoom:1,x:50,y:30})}>Reset crop</button>
      </fieldset>}
    </div>
    {image&&<figure><canvas ref={canvas} width="600" height="800" role="img" aria-label="Cropped portrait preview"/><figcaption>This crop will be submitted. No face retouching.</figcaption></figure>}
  </div>;
}
