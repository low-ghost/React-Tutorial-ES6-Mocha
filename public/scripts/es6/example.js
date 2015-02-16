/**
 * This file provided by Facebook is for non-commercial testing and evaluation purposes only.
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

let converter = new Showdown.converter()

let Comment = React.createClass({
  render() {
    let rawMarkup = converter.makeHtml(this.props.children.toString())
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    )
  }
})

let CommentBox = React.createClass({
  loadCommentsFromServer() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: (data) => {
        this.setState({ data })
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString())
      }
    });
  },
  handleCommentSubmit(comment) {
    let comments = this.state.data
    comments.push(comment)
    this.setState({data: comments}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: (data) => {
          this.setState({ data })
        },
        error: (xhr, status, err) => {
          console.error(this.props.url, status, err.toString())
        }
      })
    })
  },
  getInitialState() {
    return {data: []}
  },
  componentDidMount() {
    this.loadCommentsFromServer()
    setInterval(this.loadCommentsFromServer, this.props.pollInterval)
  },
  render() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    )
  }
})

let CommentList = React.createClass({
  render() {
    let commentNodes = this.props.data.map((comment, index) => {
      return (
        // `key` is a React-specific concept and is not mandatory for the
        // purpose of this tutorial. if you're curious, see more here:
        // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
        <Comment author={comment.author} key={index}>
          {comment.text}
        </Comment>
      )
    })
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    )
  }
})

let CommentForm = React.createClass({
  handleSubmit(e) {
    e.preventDefault();
    let author = this.refs.author.getDOMNode().value.trim()
    let text = this.refs.text.getDOMNode().value.trim()
    if (!text || !author)
      return
    this.props.onCommentSubmit({author: author, text: text})
    this.refs.author.getDOMNode().value = ''
    this.refs.text.getDOMNode().value = ''
  },
  render() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    )
  }
})

React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
)
