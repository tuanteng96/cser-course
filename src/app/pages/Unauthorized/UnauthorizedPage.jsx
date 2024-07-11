import { toAbsoluteUrl } from "src/app/_ezs/utils/assetPath"


function UnauthorizedPage(props) {
  return (
    <div className='w-full h-full relative'>
      <img src={toAbsoluteUrl('images/bg1.jpg')} alt='Not have access' className='w-full h-full object-cover' />
      <div className='bg-white shadow-lg rounded max-w-2xl w-full absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 pt-20 pb-10 px-10 flex flex-col justify-center items-center'>
        <div className='font-inter text-2xl font-bold mb-3'>Không có quyền truy cập!</div>
        <div className='text-center w-10/12 text-gray-600 font-semibold'>
          Bạn không có quyền để truy cập chức năng này. Vui lòng liên hệ quản trị viên cấp quyền truy cập.
        </div>
        <div className='max-w-[300px]'>
          <img className='w-full' src={toAbsoluteUrl('images/membership.png')} alt='' />
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
