import { useState, useEffect, ChangeEventHandler } from 'react'

const Landing: React.FC = () => {
  const [inputTextC, setinputTextC] = useState('')
  const [inputTextD, setinputTextD] = useState('101120112011 10111011201110 101120111021 11501110 115021 11501110')
  const [compressedData, setCompressedData] = useState('')
  const [decompressedText, setDecompressedText] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [historyC, setHistoryC] = useState([])
  const [historyD, setHistoryD] = useState([])

  const handleHover = (hovered: boolean): void => {
    setIsHovered(hovered)
  }

  const handleInputChangeC: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newText = e.target.value
    setinputTextC(newText)
    compressText(newText).catch((error) => {
      // Handle error
      console.error('Error compressing text:', error)
    })
  }

  const handleInputChangeD: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newText = e.target.value
    setinputTextD(newText)
    decompressText(newText).catch((error) => {
      // Handle error
      console.error('Error compressing text:', error)
    })
  }

  const compressText = async (text: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8082/compress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setCompressedData(data.compressedRLE)
    } catch (error) {
      console.log('Error compressing data:', error)
    }
  }

  const decompressText = async (text: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8082/decompress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: text })
      })

      const data = await response.json()
      setDecompressedText(data.decompressedLZW)
    } catch (error) {
      console.log('Error decompressing data:', error)
    }
  }

  const handleSave = (type: string): void => {
    if (type === 'compression') {
      const newHistory: string[] = [inputTextC, ...historyC]
      if (!historyC.includes(inputTextC as never)) {
        setHistoryC(newHistory as never)
        localStorage.setItem('historyC', JSON.stringify(newHistory))
      }
    } else if (type === 'decompression') {
      const newHistory: string[] = [inputTextD, ...historyD]
      if (!historyD.includes(inputTextD as never)) {
        setHistoryD(newHistory as never)
        localStorage.setItem('historyD', JSON.stringify(newHistory))
      }
    }
  }

  const handleClear = (type: string): void => {
    if (type === 'compression') {
      setHistoryC([])
      localStorage.setItem('historyC', JSON.stringify([]))
    } else if (type === 'decompression') {
      setHistoryD([])
      localStorage.setItem('historyD', JSON.stringify([]))
    }
  }

  const handleClickHistory = async (text: string, type: string): Promise<void> => {
    if (type === 'compression') {
      setinputTextC(text)
      try {
        await compressText(text)
        // Handle success if needed
      } catch (error) {
        // Handle error
        console.error('An error occurred:', error)
        // Perform additional error handling or show an error message to the user
      }
    } else if (type === 'decompression') {
      setinputTextD(text)
      try {
        await decompressText(text)
        // Handle success if needed
      } catch (error) {
        // Handle error
        console.error('An error occurred:', error)
        // Perform additional error handling or show an error message to the user
      }
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleDeleteHistory = (text: string, type: string): void => {
    if (type === 'compression') {
      const newHistory = historyC.filter((item) => item !== text)
      setHistoryC(newHistory)
      localStorage.setItem('historyC', JSON.stringify(newHistory))
    } else if (type === 'decompression') {
      const newHistory = historyD.filter((item) => item !== text)
      setHistoryD(newHistory)
      localStorage.setItem('historyD', JSON.stringify(newHistory))
    }
  }

  const handleHistory = (): void => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const historyC = JSON.parse(localStorage.getItem('historyC') ?? 'null')
    const historyD = JSON.parse(localStorage.getItem('historyD') ?? 'null')
    if (historyC) setHistoryC(historyC)
    if (historyD) setHistoryD(historyD)
    const compressAndDecompress = async (): Promise<void> => {
      await compressText(inputTextC)
      await decompressText(inputTextD)
    }
    compressAndDecompress()
      .catch((error) => {
        console.error('Error compressing or decompressing:', error)
      })
  }, [])

  return (
    <div>
      <div className='min-h-screen bg-gray-900 relative flex items-center overflow-hidden'>
        <div className='h-auto justify-center w-full'>
          <div className='font-serif text-[50px] text-white flex justify-center mb-[50px]' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}>LZW Compression and Decompression</div>
          <div className='flex font-mono'>
            <div className='w-1/2 text-white mx-[10px]'>
              <div className='text-[20px]'>COMPRESSION</div>
              <textarea value={inputTextC} onChange={handleInputChangeC} placeholder='Enter text...' className='w-full h-[10vh] text-black resize-none mb-[20px] px-[5px]' />
              <div>Compressed Data:</div>
              <div className='w-full h-[40vh] overflow-y-auto bg-gray-800 border-black border-[3px] p-2'>{compressedData}</div>
            </div>
            <div className='w-1/2 text-white mx-[10px]'>
              <div className='text-[20px]'>DECOMPRESSION</div>
              <textarea value={inputTextD} onChange={handleInputChangeD} placeholder='Enter binary...' className='w-full h-[10vh] text-black resize-none mb-[20px] px-[5px]' />
              <div>Decompressed Text:</div>
              <div className='w-full h-[40vh] overflow-y-auto bg-gray-800 border-black border-[3px] p-2'>{decompressedText}</div>
            </div>
          </div>
          <div className='flex'>
            <div className='w-1/2'>
              <div className='relative flex justify-center items-center rounded-2xl w-[10vw] min-w-[80px] h-[5vh] mx-auto mt-[20px] bg-white text-[#686DD2] font-mono cursor-pointer hover:opacity-60' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
                onClick={() => handleSave('compression')}>
                  Save
              </div>
            </div>
            <div className='w-1/2'>
              <div className='relative flex justify-center items-center rounded-2xl w-[10vw] min-w-[80px] h-[5vh] mx-auto mt-[20px] bg-white text-[#686DD2] font-mono cursor-pointer hover:opacity-60' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
              onClick={() => handleSave('decompression')}>
                Save
              </div>
            </div>
          </div>
          <div className='relative flex flex-col justify-center items-center rounded-2xl w-[75px] h-[75px] mx-auto bg-white text-[#686DD2] font-mono cursor-pointer hover:opacity-60' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
          onClick={() => handleHistory()}>
            <div className=''>History</div>
            <div className='animate-bounce'>V</div>
          </div>
          <div className='fixed z-10 bottom-3 right-3 flex justify-center items-center rounded-2xl w-[5vh] h-[5vh] bg-white text-[#686DD2] font-mono cursor-pointer hover:bg-[#D7D7D7]' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}>
            ?
            <div
              className={`w-[40vw] absolute bg-gray-200 text-red-900 p-2 rounded-md bottom-[45px] transform -translate-x-1/2 transition-opacity duration-200 ${
                isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              Welcome to the LZW Compression and Decompression tool.
              <br />
              <br />
              To compress text:
              <br />
              - Enter your input in the &apos;COMPRESSION&apos; text area.
              <br />
              - The compression will be generated automatically.
              <br />
              - The compressed data will be displayed below.
              <br />
              To decompress data:
              <br />
              - Paste the compressed binary sequence in the &apos;DECOMPRESSION&apos; text area.
              <br />
              - The decompression will be generated automatically.
              <br />
              - The decompressed text will be shown below.
              <br />
              <br />
              Please note that the compressor can only handle ASCII characters.
            </div>
          </div>
        </div>
      </div>
      <div className='h-[50vh] bg-gray-900 relative overflow-hidden text-lg font-bold text-white'>
        <div className='flex'>
          <div className='w-1/2 mx-[10px]'>
            Compression History
            <div className='relative mt-[2px] p-2 bg-gray-800 rounded-md overflow-y-auto h-[35vh]'>
            {historyC.map((item, index) => (
              <div className="flex w-full h-auto" key={index}>
                <div
                  className="w-[95%] relative text-sm break-all p-3 items-center flex cursor-pointer hover:bg-gray-700"
                  onClick={() => {
                    handleClickHistory(item, 'compression')
                      .then(() => {
                        // Handle success if needed
                      })
                      .catch((error) => {
                        // Handle error
                        console.error('An error occurred:', error)
                        // Perform additional error handling or show an error message to the user
                      })
                  }}
                >
                  {item}
                </div>
                <div
                  className="w-[5%] text-red-600 text-[20px] cursor-pointer items-center justify-center flex hover:bg-gray-700"
                  onClick={() => handleDeleteHistory(item, 'compression')}
                >
                  X
                </div>
              </div>
            ))}
            </div>
          </div>
          <div className='w-1/2 mx-[10px]'>
            Decompression History
            <div className='relative mt-[2px] p-2 bg-gray-800 rounded-md overflow-y-auto h-[35vh]'>
              {historyD.map((item, index) => (
                <div className="flex w-full h-auto" key={index}>
                  <div
                    className="w-[95%] relative text-sm break-all p-3 items-center flex cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      handleClickHistory(item, 'decompression')
                        .then(() => {
                          // Handle success if needed
                        })
                        .catch((error) => {
                          // Handle error
                          console.error('An error occurred:', error)
                          // Perform additional error handling or show an error message to the user
                        })
                    }}
                  >
                    {item}
                  </div>
                  <div
                    className="w-[5%] text-red-600 text-[20px] cursor-pointer items-center justify-center flex hover:bg-gray-700"
                    onClick={() => handleDeleteHistory(item, 'decompression')}
                  >
                    X
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='flex'>
          <div className='w-1/2'>
            <div className='relative flex justify-center items-center rounded-2xl w-[10vw] min-w-[80px] h-[5vh] mx-auto mt-[10px] bg-white text-[#686DD2] font-mono cursor-pointer hover:opacity-60' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
            onClick={() => handleClear('compression')}>
              Clear
            </div>
          </div>
          <div className='w-1/2'>
            <div className='relative flex justify-center items-center rounded-2xl w-[10vw] min-w-[80px] h-[5vh] mx-auto mt-[10px] bg-white text-[#686DD2] font-mono cursor-pointer hover:opacity-60' style={{ filter: 'drop-shadow(0px 5px 1px rgba(0, 0, 0, 0.25))' }}
            onClick={() => handleClear('decompression')}>
              Clear
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
