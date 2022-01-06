const { newEnforcer } = require('casbin');
const express = require('express');
const users = require('../users')
const app = express();

app.use(express.json())

const resolveUserRole = (user) => {
  //Would query DB
  const userWithRole = users.find(u => u.id === user.id)
  return userWithRole.role
}

const hasPermission = (action) => {
  return async (req, res, next) => {
    const e = await newEnforcer('./rbac_model.conf', './rbac_policy.csv');
    const { user } = req.body
    const { resource } = req.params
    const role = resolveUserRole(user)
    const allowed = await e.enforce(role, resource, action)
    if (!allowed) {
      res.status(403).send('Forbidden').end()
    } else {
      next()
    }
  }
}

app.post('/api/view/:resource', hasPermission('view'), (req, res) => {
  res.send('Got Permission')
})

app.post('/api/edit/:resource', hasPermission('edit'), (req, res) => {
  res.send('Got Permission')
})

app.listen(8080, () => {
  console.log('listening on port 8080')
})
