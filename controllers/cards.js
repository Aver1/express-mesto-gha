const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const ValidarionErrror = require('../errors/ValidarionErrror');
const PermissionError = require('../errors/PermissionError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.status(200);
      res.send(cards);
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  if (!name || !link) {
    // res.status(400).send({ message: 'name or link are not correct' });
    // return;
    throw new ValidarionErrror('name or link are not correct');
  }

  Card.create({ name, link, owner: userId })
    .populate(['owner'])
    .then((card) => res.status(200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // res.status(400).send({ message: 'name, link are not correct' });
        // return;
        return next(new ValidarionErrror('name, link are not correct'));
      }
      return next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;

  if (cardId.length !== 24) {
    // res.status(400).send({ message: 'Переданы некорректные данные.' });
    // return;
    throw new ValidarionErrror('Переданы некорректные данные.');
  }

  Card.findById(cardId)
    .then((card) => {
      if (card === null) {
        // res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        // return;
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      if (!card.owner.equals(_id)) {
        // res.status(401).send({ message: 'У вас нет прав на это действие.' });
        // return;
        throw new PermissionError('У вас нет прав на это действие.');
      }
      return card.remove().then(() => res.status(200).send({ data: card }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // res.status(400).send({ message: 'Указан некорректный id.' });
        // return;
        return next(new ValidarionErrror('Указан некорректный id.'));
      }
      return next(err);
    });
};

module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  if (cardId.length !== 24) {
    // res.status(400).send({ message: 'Переданы некорректные данные.' });
    // return;
    throw new ValidarionErrror('Переданы некорректные данные.');
  }

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card === null) {
        // res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        // return;
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      res.status(200);
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.path === '_id') {
        // res.status(400).send({ message: 'Указан некорректный id.' });
        // return;
        return next(new ValidarionErrror('Указан некорректный id.'));
      }
      return next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  if (cardId.length !== 24) {
    // res.status(400).send({ message: 'Переданы некорректные данные.' });
    // return;.
    throw new ValidarionErrror('Переданы некорректные данные.');
  }

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card === null) {
        // res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        // return;
        throw new NotFoundError('Карточка с указанным id не найдена.');
      }
      res.status(200);
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        // res.status(400).send({ message: 'Указан некорректный id.' });
        // return;
        return next(new ValidarionErrror('Указан некорректный id.'));
      }
      return next(err);
    });
};
