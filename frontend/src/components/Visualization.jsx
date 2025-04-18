import dummyOne from '../images/dummy.png';
import dummyTwo from '../images/dummyTwo.png';

export default function Visualization(props) {
    return (
        <div className="visual-container">
            <h1 className="username">Welcome Bill Howe</h1>
            <div className="visual-generator">
                <h2>Visualization Type</h2>
                <select className="visualization-dropdown">
                    <option value="" disabled selected>Select Type</option>
                </select>
                <textarea className="visualization-prompt" placeholder="Describe the visualization. Include x and y values!"></textarea>
                <div className="visual-buttons-container">
                    <button className="cancelButton">Cancel</button>
                    <button className="generateButton">Generate</button>
                </div>
            </div>
            <div className="visual-section">
                <h2>Publication Visualization from 2020-2024</h2>
                <div className="image-container">
                    <img src={dummyOne} alt="Publication Visualization" />
                </div>
            </div>
            <div className="publication-distribution">
                <h2>Publication Distribution</h2>
                <div className="image-container">
                    <img src={dummyTwo} alt="Publication Distribution" />
                </div>
            </div>
        </div>
    )
}