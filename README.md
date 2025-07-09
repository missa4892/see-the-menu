# See the Menu

This web application allows users to upload a picture of a physical restaurant menu and generates images for each of the menu items listed.

This project is built with [Next.js](https://nextjs.org/).

## How it works

1.  The user uploads an image of a menu to the Next.js frontend.
2.  The image is sent to a Next.js API route.
3.  The backend uses OpenAI's GPT-4o vision model to perform both OCR and intelligent parsing directly on the uploaded image, identifying menu items with titles and descriptions.
4.  For each menu item, the user has two options:
    - **Generate Image:** Creates a unique, AI-generated image using OpenAI's DALL-E 3 model.
    - **Find Image:** Searches Google for a real-world photo of the menu item.
5.  The resulting image is displayed to the user on the frontend.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd menu-image-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following keys. You will need API keys from both OpenAI and Google.

    ```
    # For OpenAI Image Generation & Vision Analysis
    IMAGE_API_KEY=your_openai_api_key_here

    # For Google Image Search
    GOOGLE_API_KEY=your_google_api_key_here
    GOOGLE_CX=your_google_custom_search_engine_id_here
    ```

    - To get an **OpenAI API Key**, visit the [OpenAI API keys](https://platform.openai.com/api-keys) page.
    - To get a **Google API Key** and **Custom Search Engine ID (CX)**, follow the setup instructions in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and the [Programmable Search Engine control panel](https://programmablesearchengine.google.com/controlpanel/all). Ensure your search engine is configured to **search the entire web** with **image search enabled**.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project. You will need to add an API key for an image generation service later.
    ```
    IMAGE_API_KEY="your-api-key-here"
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
