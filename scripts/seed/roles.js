export default [
    {
        name: "Admin",
        description: "Admin can access whole application, and they have all Permissions",
        permissions: ["*"],
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        seededAt: new Date()
    },
    {
        name: "Manager",
        description: "Manager also have all permissions, but they have some Restrictions",
        permissions: ["user:create", "user:view", "user:edit", "user:delete"],
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        seededAt: new Date()
    }
]