import React, { useMemo } from 'react'
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuid } from "uuid";
import useStore from '../store';
import { exportUSDZasFile, exportGLTFasFile } from '../helpers/arExportHelper';


type Props = {

    sceneRef: React.MutableRefObject<THREE.Group | null>;
}

const QRCode = ({ sceneRef }: Props) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [sceneID, setSceneID] = useState<string | null>(null);
    const uploadFile = useStore(state => state.uploadFile);
    const [url, setURL] = useState<string | null>(null);


    const handleGenerateQR = async () => {
        setIsLoading(true);
        const unique_id = uuid();
        const small_id = unique_id.slice(0, 8) as string;
        console.log("generating QR code");

        setSceneID(small_id);


        const [usdz, gltf] = await Promise.all([
            exportUSDZasFile(sceneRef.current),
            exportGLTFasFile(sceneRef.current)
        ]);

        console.log("uploading files");
        console.log(usdz, gltf);







        await Promise.all([
            uploadFile(usdz, small_id),
            uploadFile(gltf, small_id)
        ]);


        console.log("uploaded files");
        setURL(`https://fabulous-macaron-23ebff.netlify.app/arviewer?sceneID=${small_id}`)
        setIsLoading(false);


    }

    const calculatedSize = useMemo(() => {

        if (window.innerWidth < 768) {
            return 150;
        } else if (window.innerWidth < 1441) {
            return 200;

        } else {
            return 250;
        }

    }, [])

    return (
        <div className='hidden  p-2  lg:p-2 xxl:p-5 items-center justify-between flex-col  gap-3 bg-white  rounded-md lg:flex w-full'>
            <span className='lg:text-xl xxl:text-2xl font-bold'>View in your Space</span>
            {

                isLoading ? <div className={`flex items-center justify-center  flex-col  border-blue-500`} style={{
                    width: `${calculatedSize}px`,
                    height: `${calculatedSize - 50}px`

                }}>


                    <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                </div> :
                    <QRCodeCanvas
                        id="qrCode"
                        value={url || "https://fabulous-macaron-23ebff.netlify.app/arviewer?sceneID=39d2c0a2"}
                        size={calculatedSize}
                        bgColor={"#ffffff"}
                        level={"H"}
                    />

            }

            <button onClick={handleGenerateQR} className={`bg-blue-400 px-5 py-2 w-[${calculatedSize}px] text-white rounded-md`} style={{
                width: `${calculatedSize}px`
            }}>Generate QR Code</button>
            {
                isLoading && <span className='w-full text-sm text-gray-500 text-center mt-2'>*This will take a few seconds,please wait...</span>
            }
        </div >
    )
}

export default QRCode