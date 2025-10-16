export default {
  common: {
    errors: {
      system: 'A system error occurred',
      tokenExpired: 'Your session has expired. Please sign in again.',
      network: 'Network error',
    },
    validation: {
      id: {
        invalidFormat: 'The ID number format is invalid',
        invalidRegion: 'The region code is invalid',
        invalidChecksum: 'The ID checksum is incorrect',
        invalidLength: 'The ID number must be 18 characters',
        required: 'The ID number is required',
      },
      phone: {
        invalidFormat: 'The mobile number format is invalid',
        invalidLength: 'The mobile number must be 11 digits',
        required: 'The mobile number is required',
      },
    },
    time: {
      unsupportedUnit: 'Unsupported time unit: {from} or {to}',
    },
  },
  login: {
    brand: {
      sloganFirst: 'Together as one',
      sloganSecond: 'Powering productivity',
    },
    language: {
      title: 'Language',
      cancel: 'Cancel',
    },
    form: {
      username: {
        placeholder: 'Enter mobile number or employee ID',
        required: 'Please enter your username',
      },
      password: {
        placeholder: 'Enter password',
        required: 'Please enter your password',
      },
    },
    button: {
      submit: 'Sign In',
      loading: 'Signing in…',
    },
    toast: {
      success: 'Signed in successfully',
      fail: 'Sign-in failed, please try again',
    },
  },
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
        overtime: 'Overtime this month (h)',
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
    workTime: {
      title: 'Work Time Lookup',
      dateLabel: 'Attendance date',
      punchDetailTitle: 'Punch details',
      punchTimeLabel: 'Punch time',
      groups: {
        attendance: 'Attendance data',
        overtime: 'Overtime data',
        abnormal: 'Exceptions',
        correction: 'Adjusted attendance',
      },
      fields: {
        normalHours: 'Regular hours',
        travelNormalHours: 'Travel regular hours',
        paidLeaveHours: 'Paid leave hours',
        unpaidLeaveHours: 'Unpaid leave hours',
        restHours: 'Weekend rest hours',
        holidayHours: 'Holiday rest hours',
        paidStopHours: 'Paid shutdown hours',
        unpaidStopHours: 'Unpaid shutdown hours',
        cardOverHours: 'Clock-in overtime hours',
        applyOverHours: 'Requested overtime hours',
        normalOverHours: 'Weekday overtime hours',
        travelOverHours: 'Travel overtime hours',
        restOverHours: 'Weekend overtime hours',
        holidayOverHours: 'Holiday overtime hours',
        overToLeaveHours: 'Overtime to leave hours',
        leaveSettlementHours: 'Leave settlement hours',
        lateMinutes: 'Late minutes',
        lateCount: 'Late occurrences',
        leaveEarlyMinutes: 'Early leave minutes',
        leaveEarlyCount: 'Early leave occurrences',
        absenteeismHours: 'Absence hours',
        correctionNormalHours: 'Adjusted regular hours',
        correctionNormalOverHours: 'Adjusted weekday overtime',
        correctionWeekendOverHours: 'Adjusted weekend overtime',
        correctionHolidayOverHours: 'Adjusted holiday overtime',
      },
      loadFail: 'Failed to load data',
      emptyValue: '-',
    },
  },
};
