import { NextPage } from "next";

const Scheduler: NextPage = () => {
    return (
        <div className="grid place-items-center h-full">
            <div>
                <h1 className="text-4xl text-left pb-4">ULC Schedule Maker</h1>
                <div className="flex flex-row items-center">
                    <div>Calendar</div>
                    <div className=""></div>
                    <div className="dropdown dropdown-hover">
                        <label tabIndex={0} className="btn m-1">
                            Choose Calendar
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <a>Item 1</a>
                            </li>
                            <li>
                                <a>Item 2</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scheduler;
