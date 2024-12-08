export const calculateTotalBranches = (branches) => {
    return branches.length;
};

export const calculateSumCustomersPerBranch = (branches) => {
    return branches.reduce((totalCustomers, branch) => totalCustomers + branch.customers, 0);
};