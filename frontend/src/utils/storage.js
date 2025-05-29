// Session storage utilities
export const getStudentName = () => {
  return sessionStorage.getItem('studentName');
};

export const setStudentName = (name) => {
  sessionStorage.setItem('studentName', name);
};

export const hasStudentName = () => {
  return !!getStudentName();
}; 