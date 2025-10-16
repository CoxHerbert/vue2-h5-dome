export default {
  routes: {
    home: 'Home',
    apps: 'Applications',
    me: 'Profile',
    meChildren: {
      points: 'My Points',
      leave: 'Leave Days (Monthly)',
      travel: 'Travel Days (Monthly)',
      overtime: 'Overtime Hours (Monthly)',
      punch: 'Today\'s Punches',
      workTime: 'Work Time Lookup',
      punchRecord: 'Punch History',
    },
    recruit: {
      campusList: 'Campus Positions',
      campusApply: 'Campus Application',
      campusApplyDetail: 'Application Details',
    },
  },
  me: {
    navTitle: 'Profile',
    dashboard: {
      pointsLabel: 'My Points',
      joinDays: 'With Dongchuang for {days} days',
      metrics: {
        leave: 'Leave days this month',
        travel: 'Travel days this month',
        overtime: 'Overtime hours this month',
      },
      todayPunch: {
        title: 'Today\'s Punches',
        timeLabel: 'Punch Time',
        empty: 'No punches recorded today',
      },
      functions: {
        title: 'My Shortcuts',
        items: {
          workTime: 'Work time inquiry',
          punchRecord: 'Punch history',
        },
      },
    },
    placeholder: {
      default: 'This feature is under preparation',
    },
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
