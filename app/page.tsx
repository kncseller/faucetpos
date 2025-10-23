import Image from "next/image";
import Script from 'next/script';

export default function Home() {
  return (
    <>
    <Script src="/build/jscore.js" strategy="beforeInteractive" /> 

    <link rel="stylesheet" href="/build/csscore.css" />
    <link rel="stylesheet" href="/build/mine.min.css" />
    <link rel="stylesheet" href="/build/app.css" />
    <link rel="stylesheet" href="/build/font.css" /> 
    <div className="screen_box">

  <div className="box-row-col">

      <div className="a-col">

      </div>

      <div className="a-col a-auto">

        <div  className='imgbox'>

          

        </div>

        <div className="centerloading">

          <div className="lds-ripple"><div></div><div></div></div>

        </div>

      </div>

      <div className="a-col">

      </div>

  </div>

</div>

  
    </>
  );
}
