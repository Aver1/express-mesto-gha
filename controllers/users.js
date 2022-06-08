const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AlreadyExistError = require('../errors/AlreadyExistError');
const NotFoundError = require('../errors/NotFoundError');
const UnAuthorizedError = require('../errors/UnAuthorizedError');
const ValidarionErrror = require('../errors/ValidarionErrror');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200);
      res.send({ data: users });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const userID = req.params.userId;

  User.findById(userID)
    .then((user) => {
      if (user === null) {
        // res.status(404).send({ message: 'Запрашиваемый пользователь не найден' });
        // return;
        throw new NotFoundError('Запрашиваемый пользователь не найден');
      }
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // res.status(400).send({ message: 'Запрашиваемый пользователь не найден' });
        // return;
        return next(new ValidarionErrror('Запрашиваемый пользователь не найден'));
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!validator.isEmail(email)) {
    // res.status(400).send({ message: 'email not correct' });
    // return;
    throw new ValidarionErrror('email not correct');
  }

  if (!password) {
    // res.status(400).send({ message: 'password not correct' });
    // return;
    throw new ValidarionErrror('password not correct');
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      avatar,
      about,
      name,
    }))
    .then((user) => res.status(200).send({
      data:
      {
        email: user.email,
        avatar: user.avatar,
        name: user.name,
        about: user.about,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // res.status(400).send({ message: 'name, about or avatar are not correct' });
        // return;
        return next(new ValidarionErrror('name, about or avatar are not correct'));
      }
      if (err.code === 11000) {
        return next(new AlreadyExistError('this Email is already exist'));
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  if (!avatar) {
    // res.status(400).send({ message: 'avatar are not correct' });
    // return;
    throw new ValidarionErrror('avatar are not correct');
  }

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // res.status(400).send({ message: 'avatar are not correct' });
        // return;
        return next(new ValidarionErrror('avatar are not correct'));
      }
      return next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  if (!name || !about) {
    // res.status(400).send({ message: 'name, about are not correct' });
    // return;
    throw new ValidarionErrror('name, about are not correct');
  }

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // res.status(400).send({ message: 'name, about are not correct' });
        // return;
        return next(new ValidarionErrror('name, about are not correct'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'Superkey', { expiresIn: '7d' });
      res.status(200).send({ jwt: token });
    })
    .catch(() => {
      // res
      //   .status(401)
      //   .send({ message: err.message });
      next(new UnAuthorizedError('Неверные почта или пароль'));
    });
};

module.exports.getUserProfile = (req, res, next) => {
  const { _id } = req.user;
  User.findById({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден!');
      }
      if (user === null) {
        throw new NotFoundError('Пользователь не найден!');
      }
      res.status(200);
      res.send({ data: user });
    })
    .catch(next);
};
