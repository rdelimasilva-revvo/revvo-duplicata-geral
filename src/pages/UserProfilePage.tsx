import React from 'react';
import UserProfile from '@/components/UserProfile/UserProfile';

const UserProfilePage = () => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#F5F6F7] p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <UserProfile />
      </div>
    </div>
  );
};

export default UserProfilePage;

