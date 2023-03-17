import React from 'react'

function Participants({participants}) {
  return (
    <div className="participants">
        {Array(3).fill().map((item,index)=>(
          <div className='participant' key={index}>
            <p className='paticipant__number'>Participant {index+1}</p>
            <p className='participant__address'> {(participants[index] && `address: ${participants[index]}`)}</p>
            <p className='participant__not-assigned'>{!participants[index] && "Not Assigned Yet"}</p>
          </div>
        ))}
    </div>
  )
}

export default Participants