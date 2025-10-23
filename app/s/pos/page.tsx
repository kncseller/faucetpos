import Image from "next/image";
import Script from 'next/script';

export default function Home() {
  return (
    <>
    <Script src="/s/pos/jscore.js" strategy="beforeInteractive" /> 

    <link rel="stylesheet" href="/s/pos/csscore.css" />
    <link rel="stylesheet" href="/s/pos/app.min.css" />
    <link rel="stylesheet" href="/s/pos/app.css" />
    <link rel="stylesheet" href="/s/pos/font.css" /> 
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
