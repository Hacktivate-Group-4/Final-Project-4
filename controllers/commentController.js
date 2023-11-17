const { Comment, User, Photo } = require('../models');

class CommentController {
  static async GetAllComments(req, res) {
    try {
      const comments = await Comment.findAll({
        include: [User, Photo],
      });
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async GetOneCommentById(req, res) {
    const id = +req.params.id;
    try {
      const comment = await Comment.findByPk(id, {
        include: [User, Photo],
      });
      if (comment) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async CreateComment(req, res) {
    try {
      const { comment, PhotoId } = req.body;
      const userData = req.UserData;

      const newComment = await Comment.create({
        comment,
        UserId: userData.id,
        PhotoId,
      });

      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async UpdateOneCommentById(req, res) {
    const id = +req.params.id;
    const { comment } = req.body;

    try {
      const [updatedRowsCount, updatedRows] = await Comment.update(
        { comment },
        {
          where: {
            id,
          },
          returning: true,
        }
      );

      if (updatedRowsCount > 0) {
        res.status(200).json(updatedRows[0]);
      } else {
        res.status(404).json({ message: `Comment with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async DeleteOneCommentById(req, res) {
    const id = +req.params.id;

    try {
      const deletedRowCount = await Comment.destroy({
        where: {
          id,
        },
      });

      if (deletedRowCount > 0) {
        res
          .status(200)
          .json({ message: `Comment with id ${id} deleted successfully` });
      } else {
        res.status(404).json({ message: `Comment with id ${id} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CommentController;
