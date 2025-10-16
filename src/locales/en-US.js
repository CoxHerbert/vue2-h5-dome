export default {
  routes: {
    home: 'Home',
    apps: 'Applications',
    me: 'Profile',
    recruit: {
      campusList: 'Campus Positions',
      campusApply: 'Campus Application',
      campusApplyDetail: 'Application Details',
    },
  },
  me: {
    navTitle: 'Profile',
    language: {
      title: 'Language',
      zhCN: 'Chinese',
      enUS: 'English',
    },
    profile: {
      unnamed: 'Unnamed User',
      account: 'Account',
    },
    cells: {
      position: 'Position',
      role: 'Role',
      joinedDate: 'Onboard Date',
      email: 'Email',
    },
    actions: {
      changePassword: 'Change Password',
      logout: 'Log Out',
    },
    form: {
      title: 'Change Password',
      oldPassword: {
        label: 'Current Password',
        placeholder: 'Enter current password',
      },
      newPassword: {
        label: 'New Password',
        placeholder: 'Enter new password',
      },
      confirmPassword: {
        label: 'Confirm Password',
        placeholder: 'Re-enter new password',
      },
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    validation: {
      newPassword: 'Password must be at least 6 characters',
      confirmPassword: 'The passwords do not match',
    },
    dialog: {
      logoutTitle: 'Confirm Sign-out',
      logoutMessage: 'Are you sure you want to sign out?',
    },
    toast: {
      changePasswordSuccess: 'Password updated',
      changePasswordFail: 'Update failed',
    },
  },
};
